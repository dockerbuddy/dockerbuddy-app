package pl.edu.agh.dockerbuddy

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.messaging.simp.SimpMessagingTemplate
import pl.edu.agh.dockerbuddy.influxdb.InfluxDbProxy
import pl.edu.agh.dockerbuddy.model.alert.AlertType
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.model.entity.MetricRule
import pl.edu.agh.dockerbuddy.model.enums.RuleType
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import pl.edu.agh.dockerbuddy.model.metric.MetricType
import pl.edu.agh.dockerbuddy.repository.HostRepository
import pl.edu.agh.dockerbuddy.service.AlertService
import pl.edu.agh.dockerbuddy.service.HostService

@ExtendWith(MockitoExtension::class)
class AlertServiceTest {
    @Mock
    private lateinit var template: SimpMessagingTemplate

    @Mock
    private lateinit var hostRepository: HostRepository

    @Mock
    private lateinit var influxDbProxy: InfluxDbProxy

    @Mock
    private lateinit var hostService: HostService

    @InjectMocks
    private lateinit var alertService: AlertService

    @Test
    fun appendAlertTypeToMetrics_Test() {
        // given
        val hostSummary = loadMock("mocks/hostSummary1.json", HostSummary::class.java)
        val hostRules = loadMock("mocks/host1.json", Host::class.java).hostRules

        // when
        alertService.appendAlertTypeToMetrics(hostSummary, hostRules)

        // then
        assertEquals(AlertType.CRITICAL, hostSummary.metrics.first { it.metricType == MetricType.CPU_USAGE }.alertType)
        assertEquals(AlertType.WARN, hostSummary.metrics.first { it.metricType == MetricType.MEMORY_USAGE }.alertType)
        assertEquals(AlertType.OK, hostSummary.metrics.first { it.metricType == MetricType.DISK_USAGE }.alertType)
    }

    @Test
    fun appendAlertTypeToContainer_Test() {
        // given
        val hostSummary = loadMock("mocks/hostSummary1.json", HostSummary::class.java)
        val host = loadMock("mocks/host1.json", Host::class.java)

        // when
        alertService.appendAlertTypeToContainers(hostSummary, host)

        // then
        assertEquals(AlertType.OK, hostSummary.containers.first { it.name == "cont1" }.alertType)
        assertEquals(AlertType.OK, hostSummary.containers.first { it.name == "cont2" }.alertType)
        assertEquals(AlertType.CRITICAL, hostSummary.containers.first { it.name == "cont3" }.alertType)
    }
}