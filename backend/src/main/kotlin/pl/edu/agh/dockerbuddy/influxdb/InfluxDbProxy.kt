package pl.edu.agh.dockerbuddy.influxdb

import com.influxdb.client.kotlin.InfluxDBClientKotlinFactory
import com.influxdb.client.domain.WritePrecision
import com.influxdb.client.write.Point
import io.reactivex.internal.util.ExceptionHelper
import kotlinx.coroutines.channels.toList
import org.dom4j.rule.Rule
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import pl.edu.agh.dockerbuddy.model.AlertType
import pl.edu.agh.dockerbuddy.model.RuleType
import pl.edu.agh.dockerbuddy.model.metric.BasicMetric
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import java.lang.IllegalArgumentException
import java.time.Instant
import javax.persistence.EntityNotFoundException

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
            .addField("memory_usage_total", hostSummary.memoryUsage.total)
            .addField("memory_usage_value", hostSummary.memoryUsage.value)
            .addField("memory_usage_percent", hostSummary.memoryUsage.percent)
            .addField("disk_usage_total", hostSummary.diskUsage.total)
            .addField("disk_usage_value", hostSummary.diskUsage.value)
            .addField("disk_usage_percent", hostSummary.diskUsage.percent)
            .addField("cpu_usage_total", hostSummary.cpuUsage.total)
            .addField("cpu_usage_value", hostSummary.cpuUsage.value)
            .addField("cpu_usage_percent", hostSummary.cpuUsage.percent)
//            .time(hostSummary.timestamp, WritePrecision.MS) // TODO use provided timestamp
            .time(Instant.now().toEpochMilli(), WritePrecision.MS)
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
                .addField("status", container.status)
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

    suspend fun queryInfluxDb(metricType: String, hostId: Long, start: String, end: String): List<CustomFluxRecord> {

        if (metricType !in checklist)
            throw IllegalArgumentException("Unknown metric type: $metricType")

        val influxDBClient = InfluxDBClientKotlinFactory.create(url, token.toCharArray(), organization, bucket)
        val fluxQuery = ("from(bucket: \"$bucket\")\n"
                + " |> range(start: $start, stop: $end)"
                + " |> filter(fn: (r) => (" +
                    "r._measurement == \"host_stats\" and " +
                    "r.host_id == \"$hostId\" and " +
                    "r._field == \"$metricType\"))"
                )

        val result = influxDBClient.getQueryKotlinApi().query(fluxQuery).toList().map { CustomFluxRecord(
            it.time.toString(),
            it.value as Double
        ) }

        if (result.isEmpty()) emptyList<CustomFluxRecord>()

        logger.info("${result.size} records fetched form InfluxDB")
        return result
    }

    suspend fun saveAlert(hostId: Long, basicMetric: BasicMetric, ruleType: RuleType){
        logger.info("Saving alert for hostId $hostId")
        logger.debug("$basicMetric")
        val influxDBClient = InfluxDBClientKotlinFactory.create(url, token.toCharArray(), organization, bucket)
        val writeApi = influxDBClient.getWriteKotlinApi()

        val alertPoint = Point.measurement("alerts")
                .addTag("host_id", hostId.toString())
//                .addTag("alert_type", basicMetric.alertType.toString())
                .addTag("rule_type", ruleType.toString())
                .addField("value", basicMetric.value)
                .addField("total", basicMetric.total)
                .addField("percent", basicMetric.percent)
                .time(Instant.now().toEpochMilli(), WritePrecision.MS)

        writeApi.writePoint(alertPoint)
    }

    suspend fun queryAlerts(hostId: Long?, start: String, end: String?): List<AlertRecord> {

        val influxDBClient = InfluxDBClientKotlinFactory.create(url, token.toCharArray(), organization, bucket)
        val fluxQuery = ("from(bucket: \"$bucket\")\n"
                + " |> range(start: $start, stop: ${end ?: "now()"})"
                + " |> filter(fn: (r) => (" +
                "r._measurement == \"alerts\" and " +
                "r._field == \"percent\" " +
                if (hostId != null) " and r.host_id == \"$hostId\"))" else "))"
                )

        val result = influxDBClient.getQueryKotlinApi().query(fluxQuery).toList().map {
            logger.info(it.values.toString())
            AlertRecord(
                    it.values["host_id"].toString().toLong(),
                    AlertType.valueOf(it.values["alert_type"].toString()),
                    RuleType.valueOf(it.values["rule_type"].toString()),
                    it.value as Double,
                    it.time.toString()
            ) }.sortedByDescending { it.time }
        //sorry for sorting here but there are some problems with pagination functions in influx

        logger.info("${result.size} records fetched form InfluxDB")
        return result
    }
}