package pl.edu.agh.dockerbuddy

import com.influxdb.client.kotlin.InfluxDBClientKotlin
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.test.util.ReflectionTestUtils
import pl.edu.agh.dockerbuddy.influxdb.InfluxDbProxy

@ExtendWith(MockitoExtension::class)
class InfluxDbProxyTest {
//    @Mock
//    private lateinit var influxDBClient: InfluxDBClientKotlin
//
//    private lateinit var influxDbProxy: InfluxDbProxy
//
//    private val token = "token"
//    private val organization = "agh"
//    private val bucket = "metrics"
//    private val url = "https://localhost:8086"
//
//    @BeforeEach
//    fun setUp() {
//        influxDbProxy = InfluxDbProxy()
//        ReflectionTestUtils.setField(influxDbProxy, "token", token)
//        ReflectionTestUtils.setField(influxDbProxy, "organization", organization)
//        ReflectionTestUtils.setField(influxDbProxy, "bucket", bucket)
//        ReflectionTestUtils.setField(influxDbProxy, "url", url)
//    }

    @Test
    fun test() {
        // TODO mock static methods that return writeApi
//        // given
//        val mocked = mock(InfluxDBClientKotlinFactory::class.java)
//        val writeApi = mock(WriteKotlinApi::class.java)
//
//        // when
//        `when`(influxDBClient.getWriteKotlinApi()).thenReturn(writeApi)
//        given(InfluxDBClientKotlinFactory.create(url, token.toCharArray(), organization, bucket))
//            .willReturn(influxDBClient)
//
//        // then
//        runBlocking {
//            verify(writeApi, org.mockito.kotlin.times(2)).writePoint(any(Point::class.java))
//        }


//        mocked.`when`<InfluxDBClientKotlinFactory>{ InfluxDBClientKotlinFactory.create("", "".toCharArray(), "", "") }.thenReturn(influxDBClient)

    }
}