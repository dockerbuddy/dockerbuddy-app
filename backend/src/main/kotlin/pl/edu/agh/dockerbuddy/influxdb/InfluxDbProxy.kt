package pl.edu.agh.dockerbuddy.influxdb

import com.influxdb.client.kotlin.InfluxDBClientKotlinFactory
import com.influxdb.client.domain.WritePrecision
import com.influxdb.client.write.Point
import kotlinx.coroutines.channels.toList
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import pl.edu.agh.dockerbuddy.model.alert.Alert
import pl.edu.agh.dockerbuddy.model.alert.AlertType
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import pl.edu.agh.dockerbuddy.model.metric.MetricType
import java.lang.IllegalArgumentException
import java.time.*
import java.util.*

@Service
class InfluxDbProxy {
    @Value("\${influxdb.token}")
    lateinit var token: String

    @Value("\${influxdb.organization}")
    lateinit var organization: String

    @Value("\${influxdb.bucket}")
    lateinit var bucket: String

    @Value("\${influxdb.url}")
    lateinit var url: String

    private val logger = LoggerFactory.getLogger(InfluxDbProxy::class.java)

    @Volatile var alertCounter = 0

    var checklist = mutableListOf<String>()

    init {
        val metricTypes = MetricType.values().map { it.toString() }
        val metricVariations = listOf("total", "value", "percent")

        for (metric in metricTypes) {
            for (variation in metricVariations) {
                checklist.add(metric.lowercase() + "_" + variation)
            }
        }
        println(checklist)
    }

    suspend fun saveMetric(hostId: UUID, hostSummary: HostSummary) {
        logger.info("Saving metric for host $hostId")
        logger.debug("$hostSummary")
        val influxDBClient = InfluxDBClientKotlinFactory.create(url, token.toCharArray(), organization, bucket)
        val writeApi = influxDBClient.getWriteKotlinApi()

        val hostPoint = Point.measurement("host_stats")
            .addTag("host_id", hostId.toString())
            .addTag("metric_id", hostSummary.id.toString())
            .time(Instant.parse(hostSummary.timestamp).toEpochMilli(), WritePrecision.MS)
        val hostMetrics = hostSummary.metrics.associateBy { it.metricType }
        for (metricType in MetricType.values()) {
            val metricTypeLowercase = metricType.toString().lowercase()
            hostPoint.addField("${metricTypeLowercase}_total", hostMetrics[metricType]?.total)
            hostPoint.addField("${metricTypeLowercase}_value", hostMetrics[metricType]?.value)
            hostPoint.addField("${metricTypeLowercase}_percent", hostMetrics[metricType]?.percent)
        }
        writeApi.writePoint(hostPoint)

        logger.info("Processing container metrics for host $hostId")
        for (container in hostSummary.containers) {
            logger.debug("> $container")
            val containerPoint = Point.measurement("container")
                .addTag("host_id", hostId.toString())
                .addTag("metric_id", hostSummary.id.toString())
                .addTag("container_id", container.id)
                .addTag("container_name", container.name)
                .addTag("image", container.image)
                .addField("status", container.status.toString())
                .time(Instant.parse(hostSummary.timestamp).toEpochMilli(), WritePrecision.MS)

            val containerMetrics = container.metrics.associateBy { it.metricType }
            for (metricType in MetricType.values()) {
                if (metricType in containerMetrics.keys) {
                    val metricTypeLowercase = metricType.toString().lowercase()
                    containerPoint.addField("${metricTypeLowercase}_total", hostMetrics[metricType]?.total)
                    containerPoint.addField("${metricTypeLowercase}_value", hostMetrics[metricType]?.value)
                    containerPoint.addField("${metricTypeLowercase}_percent", hostMetrics[metricType]?.percent)
                }
            }
            writeApi.writePoint(containerPoint)
        }
    }

    suspend fun queryInfluxDb(metricTypeVariation: String, hostId: UUID, start: String, end: String): List<CustomFluxRecord> {
        val metricTypeVariationLowercase = metricTypeVariation.lowercase()
        if (metricTypeVariationLowercase !in checklist)
            throw IllegalArgumentException("Unknown metric type: $metricTypeVariationLowercase")

        val influxDBClient = InfluxDBClientKotlinFactory.create(url, token.toCharArray(), organization, bucket)
        val fluxQuery = ("from(bucket: \"$bucket\")\n"
                + " |> range(start: $start, stop: $end)"
                + " |> filter(fn: (r) => (" +
                    "r._measurement == \"host_stats\" and " +
                    "r.host_id == \"$hostId.\" and " +
                    "r._field == \"$metricTypeVariationLowercase\"))"
                )

        val result = influxDBClient.getQueryKotlinApi().query(fluxQuery).toList().map { CustomFluxRecord(
            it.time.toString(),
            it.value as Double
        ) }

        if (result.isEmpty()) emptyList<CustomFluxRecord>()

        logger.info("${result.size} records fetched form InfluxDB")
        return result
    }

    suspend fun saveAlerts(alertList: List<AlertRecord>): List<AlertRecord> {
        for (alertRecord in alertList) {
            alertCounter = if (alertCounter > 0) --alertCounter else alertCounter
            saveAlert(Alert(alertRecord.hostId, alertRecord.alertType, alertRecord.alertMessage, true), Instant.parse(alertRecord.time).toEpochMilli())
        }
        return alertList
    }

    suspend fun saveAlert(alert: Alert, time: Long = Instant.now().toEpochMilli()) {
        logger.info("Saving alert for hostId ${alert.hostId}")
        logger.debug("$alert")
        val influxDBClient = InfluxDBClientKotlinFactory.create(url, token.toCharArray(), organization, bucket)
        val writeApi = influxDBClient.getWriteKotlinApi()

        val alertPoint = Point.measurement("alerts")
                .addTag("host_id", alert.hostId.toString())
                .addTag("alert_type", alert.alertType.toString())
                .addTag("read", alert.read.toString())
                .addField("message", alert.alertMessage)
                .time(time, WritePrecision.MS)

        writeApi.writePoint(alertPoint)
    }

    suspend fun queryAlerts(hostId: UUID?, start: String, end: String?, fetchAll: Boolean, read: Boolean?): List<AlertRecord> {
        return when {
            fetchAll -> queryAlerts(hostId, start, end, null)
            read != null -> queryAlerts(hostId, start, end, read)
            else -> throw IllegalArgumentException("If not fetching all hosts, 'read' param must be specified")
        }
    }

    private suspend fun queryAlerts(hostId: UUID?, start: String, end: String?, read: Boolean?): List<AlertRecord> {
        val influxDBClient = InfluxDBClientKotlinFactory.create(url, token.toCharArray(), organization, bucket)
        val fluxQuery = ("from(bucket: \"$bucket\")\n"
                + " |> range(start: $start, stop: ${end ?: "now()"})"
                + " |> filter(fn: (r) => (" +
                "r._measurement == \"alerts\" and " +
                "r._field == \"message\" " +
                if (read != null) "and r.read == \"$read\" " else " " +
                if (hostId != null) "and r.host_id == \"$hostId\"))" else "))"
            )

        val result = influxDBClient.getQueryKotlinApi().query(fluxQuery).toList().map {
            logger.info(it.value.toString())
            AlertRecord(
                UUID.fromString(it.values["host_id"].toString()),
                AlertType.valueOf(it.values["alert_type"].toString()),
                it.value as String,
                it.time.toString(),
                it.values["read"].toString().toBoolean()
            ) }.sortedByDescending { it.time }

        logger.info("${result.size} records fetched form InfluxDB")
        return result
    }
}