package pl.edu.agh.dockerbuddy.influxdb

import com.influxdb.client.kotlin.InfluxDBClientKotlinFactory
import com.influxdb.client.domain.WritePrecision
import com.influxdb.client.write.Point
import io.reactivex.internal.util.ExceptionHelper
import kotlinx.coroutines.channels.toList
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
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

    private val logger = LoggerFactory.getLogger(ExceptionHelper::class.java)

    // TODO research on writing data classes directly:
    //  https://github.com/influxdata/influxdb-client-java/tree/master/client-kotlin#writes
    //  https://github.com/influxdata/influxdb-client-java/blob/3d771d497dc45322be8b94f70e8b49f6dab95dac/examples/src/main/java/example/KotlinWriteApi.kt#L69

    suspend fun saveMetric(hostId: Long, hostSummary: HostSummary) {
        logger.info("Saving metric $hostSummary for host with id $hostId")
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

        logger.info("Processing container metrics for host with id $hostId")
        for (container in hostSummary.containers) {
            logger.info("> $container")
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

    suspend fun queryInfluxDb(metricType: String, hostId: Long, start: String, end: String?): List<CustomFluxRecord> {

        if (metricType !in listOf("memory_usage", "disk_usage", "cpu_usage"))
            throw IllegalArgumentException("Unknown metric type: $metricType")

        val influxDBClient = InfluxDBClientKotlinFactory.create(url, token.toCharArray(), organization, bucket)
        val fluxQuery = ("from(bucket: \"$bucket\")\n"
                + " |> range(start: $start, stop: ${end ?: "now()"})"
                + " |> filter(fn: (r) => (" +
                    "r._measurement == \"host_stats\" and " +
                    "(r._field == \"${metricType}_total\" or " +
                    "r._field == \"${metricType}_value\" or " +
                    "r._field == \"${metricType}_percent\")))"
                )

        val result = influxDBClient.getQueryKotlinApi().query(fluxQuery).toList().map { CustomFluxRecord(
            it.measurement!!,
            (it.values["host_id"] as String).toLong(),
            (it.values["metric_id"] as String).toLong(),
            it.time.toString(),
            it.field!!,
            it.value as Double
        ) }

        if (result.isEmpty()) throw EntityNotFoundException("No records found")

        logger.info("Records fetched form InfluxDB: $result")
        return result
    }
}