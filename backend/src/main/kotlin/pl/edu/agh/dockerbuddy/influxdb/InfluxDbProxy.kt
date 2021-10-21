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
import java.time.Instant

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

    val checklist = mutableListOf<String>()

    init {
        val metricTypes = listOf("memory_usage", "disk_usage", "cpu_usage")
        val metricVariations = listOf("total", "value", "percent")

        for (metric in metricTypes) {
            for (variation in metricVariations) {
                checklist.add(metric + "_" + variation)
            }
        }
    }

    suspend fun saveMetric(hostId: Long, hostSummary: HostSummary) {
        logger.info("Saving metric for host $hostId")
        logger.debug("$hostSummary")
        val influxDBClient = InfluxDBClientKotlinFactory.create(url, token.toCharArray(), organization, bucket)
        val writeApi = influxDBClient.getWriteKotlinApi()

        val hostPoint = Point.measurement("host_stats")
            .addTag("host_id", hostId.toString())
            .addTag("metric_id", hostSummary.id.toString())
//            .time(hostSummary.timestamp, WritePrecision.MS) // TODO use provided timestamp
            .time(Instant.now().toEpochMilli(), WritePrecision.MS)
        val hostMetrics = hostSummary.metrics.associateBy { it.metricType }
        for (metricType in MetricType.values()) {
            hostPoint.addField("${metricType}_total", hostMetrics[metricType]?.total)
            hostPoint.addField("${metricType}_value", hostMetrics[metricType]?.value)
            hostPoint.addField("${metricType}_percent", hostMetrics[metricType]?.percent)
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
                .addField("memory_usage_total", container.memoryUsage.total)
                .addField("memory_usage_value", container.memoryUsage.value)
                .addField("memory_usage_percent", container.memoryUsage.percent)
                .addField("cpu_usage_total", container.cpuUsage.total)
                .addField("cpu_usage_value", container.cpuUsage.value)
                .addField("cpu_usage_percent", container.cpuUsage.percent)
//                .time(hostSummary.timestamp, WritePrecision.MS) // TODO use provided timestamp
                .time(Instant.now().toEpochMilli(), WritePrecision.MS)
            writeApi.writePoint(containerPoint)
        }
    }

    suspend fun queryInfluxDb(metricTypeVariation: String, hostId: Long, start: String, end: String): List<CustomFluxRecord> {

        if (metricTypeVariation !in checklist)
            throw IllegalArgumentException("Unknown metric type: $metricTypeVariation")

        val influxDBClient = InfluxDBClientKotlinFactory.create(url, token.toCharArray(), organization, bucket)
        val fluxQuery = ("from(bucket: \"$bucket\")\n"
                + " |> range(start: $start, stop: $end)"
                + " |> filter(fn: (r) => (" +
                    "r._measurement == \"host_stats\" and " +
                    "r.host_id == \"$hostId\" and " +
                    "r._field == \"$metricTypeVariation\"))"
                )

        val result = influxDBClient.getQueryKotlinApi().query(fluxQuery).toList().map { CustomFluxRecord(
            it.time.toString(),
            it.value as Double
        ) }

        if (result.isEmpty()) emptyList<CustomFluxRecord>()

        logger.info("${result.size} records fetched form InfluxDB")
        return result
    }

    suspend fun saveAlert(alert: Alert){
        logger.info("Saving alert for hostId ${alert.hostId}")
        logger.debug("$alert")
        val influxDBClient = InfluxDBClientKotlinFactory.create(url, token.toCharArray(), organization, bucket)
        val writeApi = influxDBClient.getWriteKotlinApi()

        val alertPoint = Point.measurement("alerts")
                .addTag("host_id", alert.hostId.toString())
                .addTag("alert_type", alert.alertType.toString())
                .addField("message", alert.alertMessage)
                .time(Instant.now().toEpochMilli(), WritePrecision.MS)

        writeApi.writePoint(alertPoint)
    }

    suspend fun queryAlerts(hostId: Long?, start: String, end: String?): List<AlertRecord> {

        val influxDBClient = InfluxDBClientKotlinFactory.create(url, token.toCharArray(), organization, bucket)
        val fluxQuery = ("from(bucket: \"$bucket\")\n"
                + " |> range(start: $start, stop: ${end ?: "now()"})"
                + " |> filter(fn: (r) => (" +
                "r._measurement == \"alerts\" and " +
                "r._field == \"message\" " +
                if (hostId != null) " and r.host_id == \"$hostId\"))" else "))"
                )

        val result = influxDBClient.getQueryKotlinApi().query(fluxQuery).toList().map {
            logger.info(it.value.toString())
            AlertRecord(
                    it.values["host_id"].toString().toLong(),
                    AlertType.valueOf(it.values["alert_type"].toString()),
                    it.value as String,
                    it.time.toString()
            ) }.sortedByDescending { it.time }

        logger.info("${result.size} records fetched form InfluxDB")
        return result
    }
}