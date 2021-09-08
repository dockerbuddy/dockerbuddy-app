package pl.edu.agh.dockerbuddy.influxdb

import com.influxdb.client.kotlin.InfluxDBClientKotlinFactory
import com.influxdb.client.domain.WritePrecision
import com.influxdb.client.write.Point
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import pl.edu.agh.dockerbuddy.model.HostWithSummary
import java.time.Instant

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

//    private

    // TODO research on writing data classes directly:
    //  https://github.com/influxdata/influxdb-client-java/tree/master/client-kotlin#writes
    //  https://github.com/influxdata/influxdb-client-java/blob/3d771d497dc45322be8b94f70e8b49f6dab95dac/examples/src/main/java/example/KotlinWriteApi.kt#L69
    suspend fun saveMetrics(hostsWithSummary: MutableList<HostWithSummary>) {
        val influxDBClient = InfluxDBClientKotlinFactory.create(url, token.toCharArray(), organization, bucket)
        for (hostWithSummary in hostsWithSummary) {
            val writeApi = influxDBClient.getWriteKotlinApi()
            val hostPoint = Point.measurement("host_stats")
                .addTag("id", hostWithSummary.id.toString())
                .addTag("name", hostWithSummary.hostName)
                .addTag("ip", hostWithSummary.ip)
                .addField("memory_usage_total", hostWithSummary.hostSummary.memoryUsage.total)
                .addField("memory_usage_value", hostWithSummary.hostSummary.memoryUsage.value)
                .addField("memory_usage_percent", hostWithSummary.hostSummary.memoryUsage.percent)
                .addField("disk_usage_total", hostWithSummary.hostSummary.diskUsage.total)
                .addField("disk_usage_value", hostWithSummary.hostSummary.diskUsage.value)
                .addField("disk_usage_percent", hostWithSummary.hostSummary.diskUsage.percent)
                .addField("cpu_usage_total", hostWithSummary.hostSummary.cpuUsage.total)
                .addField("cpu_usage_value", hostWithSummary.hostSummary.cpuUsage.value)
                .addField("cpu_usage_percent", hostWithSummary.hostSummary.cpuUsage.percent)
//                .time(hostWithSummary.hostSummary.timestamp.toLong(), WritePrecision.NS)
                .time(Instant.now().nano, WritePrecision.NS)

            writeApi.writePoint(hostPoint)

            for (container in hostWithSummary.hostSummary.containers) {
                val containerPoint = Point.measurement("container")
                    .addTag("host_id", hostWithSummary.id.toString())
                    .addTag("host_name", hostWithSummary.hostName)
                    .addTag("ip", hostWithSummary.ip)
                    .addTag("container_id", hostWithSummary.ip)
                    .addTag("container_name", hostWithSummary.ip)
                    .addTag("image", hostWithSummary.ip)
                    .addField("status", container.status)
                    .addField("memory_usage_total", container.memoryUsage.total)
                    .addField("memory_usage_value", container.memoryUsage.value)
                    .addField("memory_usage_percent", container.memoryUsage.percent)
                    .addField("cpu_usage_total", container.cpuUsage.total)
                    .addField("cpu_usage_value", container.cpuUsage.value)
                    .addField("cpu_usage_percent", container.cpuUsage.percent)
                    .time(Instant.now().nano, WritePrecision.NS)

                writeApi.writePoint(containerPoint)
            }
        }
    }
}