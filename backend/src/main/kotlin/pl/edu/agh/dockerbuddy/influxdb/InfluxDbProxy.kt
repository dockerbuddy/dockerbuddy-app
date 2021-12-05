package pl.edu.agh.dockerbuddy.influxdb

import com.influxdb.client.kotlin.InfluxDBClientKotlinFactory
import com.influxdb.client.domain.WritePrecision
import com.influxdb.client.kotlin.InfluxDBClientKotlin
import com.influxdb.client.write.Point
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.toList
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import pl.edu.agh.dockerbuddy.model.alert.Alert
import pl.edu.agh.dockerbuddy.model.alert.AlertType
import pl.edu.agh.dockerbuddy.model.metric.BasicMetricType
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import pl.edu.agh.dockerbuddy.model.metric.PercentMetricType
import java.lang.IllegalArgumentException
import java.time.*
import java.util.*

@Service
class InfluxDbProxy {
    @Value("\${influxdb.token}")
    private lateinit var token: String

    @Value("\${influxdb.organization}")
    private lateinit var organization: String

    @Value("\${influxdb.bucket}")
    private lateinit var bucket: String

    @Value("\${influxdb.url}")
    private lateinit var url: String

    private val logger = LoggerFactory.getLogger(InfluxDbProxy::class.java)
    @Volatile var alertCounter = 0
    private final val checklist = mutableListOf<String>()
    private lateinit var influxDBClient: InfluxDBClientKotlin

    init {
        // create list of metrics allowed to be queried form influx
        val percentMetricTypes = PercentMetricType.values().map { it.toString() }
        val percentMetricVariations = listOf("total", "value", "percent")
        val basicMetricTypes = BasicMetricType.values().map { it.toString() }
        val basicMetricVariations = listOf("value")

        for (metric in percentMetricTypes) {
            for (variation in percentMetricVariations) {
                checklist.add("${metric.lowercase()}_$variation")
            }
        }

        for (metric in basicMetricTypes) {
            for (variation in basicMetricVariations) {
                checklist.add("${metric.lowercase()}_$variation")
            }
        }

        //  query unread alerts form influx
        var unreadAlerts: List<AlertRecord>
        CoroutineScope(Dispatchers.IO).launch {
            // wait until all properties from env variables are initialized
            while (!::token.isInitialized &&
                !::organization.isInitialized &&
                !::bucket.isInitialized &&
                !::url.isInitialized
            ) {
                delay(10)
            }
            influxDBClient = InfluxDBClientKotlinFactory.create(url, token.toCharArray(), organization, bucket)
            unreadAlerts = queryAlerts(null, "1970-01-01T00:00:00Z", null,false)
            alertCounter = unreadAlerts.size
        }
    }

    /**
     * Save host summary metrics to influxDB.
     *
     * @param hostId id of host
     * @param hostSummary host summary received from an agent
     */
    suspend fun saveMetrics(hostId: UUID, hostSummary: HostSummary) {
        logger.info("Saving metric for host $hostId")
        logger.debug("$hostSummary")
        val writeApi = influxDBClient.getWriteKotlinApi()

        // create point metadata that wall be saved in influx
        val hostPoint = Point.measurement("host_stats")
            .addTag("host_id", hostId.toString())
            .addTag("metric_id", hostSummary.id.toString())
            .time(Instant.parse(hostSummary.timestamp).toEpochMilli(), WritePrecision.MS)

        // add fields containing percent metrics to the point
        val hostPercentMetrics = hostSummary.percentMetrics.associateBy { it.metricType }
        for (metricType in PercentMetricType.values()) {
            val metricTypeLowercase = metricType.toString().lowercase()
            hostPoint.addField("${metricTypeLowercase}_total", hostPercentMetrics[metricType]?.total)
            hostPoint.addField("${metricTypeLowercase}_value", hostPercentMetrics[metricType]?.value)
            hostPoint.addField("${metricTypeLowercase}_percent", hostPercentMetrics[metricType]?.percent)
        }

        // add fields containing basic metrics to the point
        val hostBasicMetrics = hostSummary.basicMetrics.associateBy { it.metricType }
        for (metricType in BasicMetricType.values()) {
            val metricTypeLowercase = metricType.toString().lowercase()
            hostPoint.addField("${metricTypeLowercase}_value", hostBasicMetrics[metricType]?.value)
        }

        // save point in influxDB
        writeApi.writePoint(hostPoint)

        // create point for each of the host's containers
        logger.info("Processing container percent metrics for host $hostId")
        for (container in hostSummary.containers) {
            logger.debug("> $container")
            val containerPoint = Point.measurement("container")
                .addTag("host_id", hostId.toString())
                .addTag("metric_id", hostSummary.id.toString())
                .addTag("container_id", container.id)
                .addTag("container_name", container.name)
                .addTag("image", container.image)
                .addField("status", container.state.toString())
                .time(Instant.parse(hostSummary.timestamp).toEpochMilli(), WritePrecision.MS)

            val containerMetrics = container.metrics.associateBy { it.metricType }
            for (metricType in PercentMetricType.values()) {
                if (metricType in containerMetrics.keys) {
                    val metricTypeLowercase = metricType.toString().lowercase()
                    containerPoint.addField("${metricTypeLowercase}_total", hostPercentMetrics[metricType]?.total)
                    containerPoint.addField("${metricTypeLowercase}_value", hostPercentMetrics[metricType]?.value)
                    containerPoint.addField("${metricTypeLowercase}_percent", hostPercentMetrics[metricType]?.percent)
                }
            }
            writeApi.writePoint(containerPoint)
        }
    }

    /**
     * Query metrics form influxDB.
     *
     * @param metricTypeVariation metric type with variation (for example cpu_usage_percent)
     * @param hostId id of a host
     * @param start most recent timestamp of measurement (iso string)
     * @param end oldest timestamp of measurement (iso string)
     *
     * @return list of flux records with metrics form given time interval
     */
    suspend fun queryMetric(
        metricTypeVariation: String,
        hostId: UUID,
        start: String,
        end: String
    ): List<FluxRecord> {
        // validate whether requested metric is valid
        val metricTypeVariationLowercase = metricTypeVariation.lowercase()
        require(metricTypeVariationLowercase in checklist) {
            throw IllegalArgumentException("Unknown metric type: $metricTypeVariationLowercase")
        }

        val fluxQuery = (
                "from(bucket: \"$bucket\")\n"
                + " |> range(start: $start, stop: $end)"
                + " |> filter(fn: (r) => (" +
                    "r._measurement == \"host_stats\" and " +
                    "r.host_id == \"$hostId\" and " +
                    "r._field == \"$metricTypeVariationLowercase\"))"
                )

        val fetchedRecordsList = influxDBClient.getQueryKotlinApi().query(fluxQuery).toList()

        // map fetched flux records to custom data class
        val metrics = fetchedRecordsList.map { FluxRecord(
            it.time.toString(),
            it.value.toString().toDouble()
        ) }

        logger.info("${fetchedRecordsList.size} records fetched form InfluxDB")
        return metrics
    }

    /**
     * Mark alerts as read and update them in influxDB
     *
     * @param alertList list of alerts to be updated
     */
    suspend fun markAlertsRead(alertList: List<AlertRecord>) {
        for (alertRecord in alertList) {
            alertCounter = if (alertCounter > 0) --alertCounter else alertCounter // counter can't hold negative values
            saveAlert(
                Alert(alertRecord.hostId,
                    alertRecord.alertType,
                    alertRecord.alertMessage,
                    true),
                Instant.parse(alertRecord.time).toEpochMilli()
            )
        }
    }

    /**
     * Save alert to influxDB
     *
     * @param alert alert to be saved
     * @param time (OPTIONAL PARAM) alert's creation timestamp
     */
    suspend fun saveAlert(alert: Alert, time: Long = Instant.now().toEpochMilli()) {
        logger.info("Saving alert for hostId ${alert.hostId}")
        logger.debug("$alert")
        val writeApi = influxDBClient.getWriteKotlinApi()

        val alertPoint = Point.measurement("alerts")
                .addTag("host_id", alert.hostId.toString())
                .addTag("alert_type", alert.alertType.toString())
                .addTag("message", alert.alertMessage)
                .addField("read", alert.read.toString())
                .time(time, WritePrecision.MS)

        writeApi.writePoint(alertPoint)
    }

    /**
     * Query alerts form influxDB
     *
     * @param hostId id of a host
     * @param start most recent timestamp of alert (iso string)
     * @param end oldest timestamp of alert (iso string)
     * @param fetchAll flag for fetching all alerts for given host
     * @param read if fetchAll is false then specify alerts to be fetched (read on unread)
     *
     * @return list of alerts
     */
    suspend fun queryAlerts(
        hostId: UUID?,
        start: String,
        end: String?,
        fetchAll: Boolean,
        read: Boolean?
    ): List<AlertRecord> {
        return when {
            fetchAll -> queryAlerts(hostId, start, end, null)
            read != null -> queryAlerts(hostId, start, end, read)
            else -> throw IllegalArgumentException("If not fetching all hosts, 'read' param must be specified")
        }
    }

    private suspend fun queryAlerts(hostId: UUID?, start: String, end: String?, read: Boolean?): List<AlertRecord> {
        val fluxQuery = ("from(bucket: \"$bucket\")\n " +
                "|> range(start: $start, stop: ${end ?: "now()"}) " +
                "|> filter(fn: (r) => (" +
                "r._measurement == \"alerts\" " +
                (if (read != null) "and r._value == \"$read\" " else "") +
                (if (hostId != null) "and r.host_id == \"$hostId\"))" else "))")
            )

        val result = influxDBClient.getQueryKotlinApi().query(fluxQuery).toList().map {
            logger.info(it.toString())
            AlertRecord(
                UUID.fromString(it.values["host_id"].toString()),
                AlertType.valueOf(it.values["alert_type"].toString()),
                it.values["message"].toString(),
                it.time.toString(),
                it.value.toString().toBoolean()
            ) }.sortedByDescending { it.time }

        logger.info("${result.size} records fetched form InfluxDB")
        return result
    }
}