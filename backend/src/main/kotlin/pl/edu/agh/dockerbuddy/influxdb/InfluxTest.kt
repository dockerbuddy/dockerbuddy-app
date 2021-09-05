package pl.edu.agh.dockerbuddy.influxdb

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import javax.annotation.PostConstruct
import com.influxdb.client.InfluxDBClientFactory

import com.influxdb.client.domain.WritePrecision
import com.influxdb.client.write.Point
import java.time.Instant


@Service
//simple class which is testing influx connection
class InfluxTest {
    @Value("\${influxdb.token}")
    lateinit var token: String

    @Value("\${influxdb.organization}")
    lateinit var organization: String

    @Value("\${influxdb.bucket}")
    lateinit var bucket: String

    @Value("\${influxdb.url}")
    lateinit var url: String

    @PostConstruct
    fun connectAndSave(){
        val influxDBClient = InfluxDBClientFactory.create(url, token.toCharArray(), organization, bucket)
        val writeApi = influxDBClient.writeApiBlocking
        val point = Point.measurement("test_measurement")
                .addTag("location", "west")
                .addField("value", 55)
                .time(Instant.now().toEpochMilli(), WritePrecision.MS)

        writeApi.writePoint(point)
    }
}