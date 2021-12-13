package pl.edu.agh.dockerbuddy

import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.times
import org.mockito.kotlin.verify
import org.springframework.messaging.simp.SimpMessagingTemplate
import pl.edu.agh.dockerbuddy.influxdb.InfluxDbProxy
import pl.edu.agh.dockerbuddy.inmemory.InMemory
import pl.edu.agh.dockerbuddy.model.alert.Alert
import pl.edu.agh.dockerbuddy.model.alert.AlertType
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import pl.edu.agh.dockerbuddy.repository.HostRepository
import pl.edu.agh.dockerbuddy.service.AlertService
import pl.edu.agh.dockerbuddy.service.HostService
import pl.edu.agh.dockerbuddy.service.MetricService
import java.util.*
import javax.persistence.EntityNotFoundException

@ExtendWith(MockitoExtension::class)
class MetricServiceTest {
    @Mock private lateinit var alertService: AlertService
    @Mock private lateinit var hostRepository: HostRepository
    @Mock private lateinit var inMemory: InMemory
    @Mock private lateinit var influxDbProxy: InfluxDbProxy
    @Mock private lateinit var template: SimpMessagingTemplate
    @InjectMocks private lateinit var metricService: MetricService

    @Test
    suspend fun `post first metrics`() {
        // given
        val host = loadMock("mocks/host1.json", Host::class.java)
        val hostSummary = loadMock("mocks/hostSummary1.json", HostSummary::class.java)

        // when
        `when`(hostRepository.findById(host.id!!)).thenReturn(Optional.of(host))
        `when`(inMemory.getHostSummary(host.id!!)).thenReturn(null)

        // then
        metricService.processMetrics(hostSummary, host.id!!)

        // verify method calls
        verify(alertService, times(1)).initialCheckForAlertSummary(hostSummary, host)
//        runBlocking {
            verify(influxDbProxy, times(1)).saveMetrics(host.id!!, hostSummary)
//        }
    }

    @Test
    fun `post metrics when there are previous in cache`() {
        // given
        val host = loadMock("mocks/host1.json", Host::class.java)
        val hostSummary1 = loadMock("mocks/hostSummary1.json", HostSummary::class.java)
        val hostSummary2 = loadMock("mocks/hostSummary1.json", HostSummary::class.java)

        // when
        `when`(hostRepository.findById(host.id!!)).thenReturn(Optional.of(host))
        `when`(alertService.checkForAlertSummary(hostSummary1, hostSummary2, host)).thenReturn(host)
        `when`(inMemory.getHostSummary(host.id!!)).thenReturn(hostSummary2)

        // then
        metricService.processMetrics(hostSummary1, host.id!!)

        // verify method calls
        verify(alertService, times(1)).checkForAlertSummary(hostSummary1, hostSummary2, host)
        runBlocking {
            verify(influxDbProxy, times(1)).saveMetrics(host.id!!, hostSummary1)
        }
    }

    @Test
    fun `change timed out host state to online`() {
        // given
        val host = loadMock("mocks/host1.json", Host::class.java)
        val hostSummary1 = loadMock("mocks/hostSummary1.json", HostSummary::class.java)
        val alert = Alert(
            host.id!!,
            AlertType.OK,
            "Host: ${host.hostName} is back online"
        )

        // when
        host.isTimedOut = true
        `when`(hostRepository.findById(host.id!!)).thenReturn(Optional.of(host))
        `when`(alertService.initialCheckForAlertSummary(hostSummary1, host)).thenReturn(host)

        metricService.processMetrics(hostSummary1, host.id!!)

        // then
        assertEquals(false, host.isTimedOut)
        verify(alertService, times(1)).sendAlert(alert)
    }

    @Test
    fun `throw EntityNotFoundException on wrong host id`() {
        // given
        val host = loadMock("mocks/host1.json", Host::class.java)
        val hostSummary1 = loadMock("mocks/hostSummary1.json", HostSummary::class.java)

        // when
        `when`(hostRepository.findById(host.id!!)).thenReturn(Optional.empty())

        // then
        assertThrows(EntityNotFoundException::class.java, fun () {
            metricService.processMetrics(hostSummary1, host.id!!)
        })
    }
}