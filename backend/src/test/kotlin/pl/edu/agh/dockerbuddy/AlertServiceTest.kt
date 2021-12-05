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
import pl.edu.agh.dockerbuddy.model.enums.ReportStatus
import pl.edu.agh.dockerbuddy.model.metric.BasicMetricType
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import pl.edu.agh.dockerbuddy.model.metric.PercentMetricType
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
        val host = loadMock("mocks/host1.json", Host::class.java)
        val hostPercentRules = host.hostPercentRules
        val hostBasicRules = host.hostBasicRules

        // when
        alertService.appendAlertTypeToMetrics(hostSummary, hostPercentRules, hostBasicRules)

        // then
        assertEquals(AlertType.CRITICAL, hostSummary.percentMetrics.first { it.metricType == PercentMetricType.CPU_USAGE }.alertType)
        assertEquals(AlertType.WARN, hostSummary.percentMetrics.first { it.metricType == PercentMetricType.MEMORY_USAGE }.alertType)
        assertEquals(AlertType.OK, hostSummary.percentMetrics.first { it.metricType == PercentMetricType.DISK_USAGE }.alertType)
        assertEquals(AlertType.CRITICAL, hostSummary.basicMetrics.first { it.metricType == BasicMetricType.NETWORK_IN }.alertType)
        assertEquals(AlertType.OK, hostSummary.basicMetrics.first { it.metricType == BasicMetricType.NETWORK_OUT }.alertType)
    }

    @Test
    fun appendAlertTypeToContainer_Test() {
        // given
        val hostSummary = loadMock("mocks/hostSummary1.json", HostSummary::class.java)
        val prevHostSummary = loadMock("mocks/hostSummary2.json", HostSummary::class.java)
        val host = loadMock("mocks/host1.json", Host::class.java)

        // when
        alertService.appendAlertTypeToContainers(hostSummary, prevHostSummary, host)

        // then
        assertEquals(AlertType.OK, hostSummary.containers.first { it.name == "cont1" }.alertType)
        assertEquals(AlertType.OK, hostSummary.containers.first { it.name == "cont2" }.alertType)
        assertEquals(AlertType.CRITICAL, hostSummary.containers.first { it.name == "cont3" }.alertType)
    }

    @Test
    fun checkForAlertSummary_UpdateContainerReportStatus_Test() {
        // given
        val prevHostSummary = loadMock("mocks/hostSummary1.json", HostSummary::class.java)
        val hostSummary = loadMock("mocks/hostSummary2.json", HostSummary::class.java)
        val host = loadMock("mocks/host1.json", Host::class.java)

        // when
        alertService.appendAlertTypeToContainers(hostSummary, prevHostSummary, host)
        alertService.checkForAlertSummary(hostSummary, prevHostSummary, host)

        // then
        assertEquals(ReportStatus.NOT_WATCHED, hostSummary.containers.first { it.name == "cont1" }.reportStatus)
        assertEquals(ReportStatus.NEW, hostSummary.containers.first { it.name == "cont2" }.reportStatus)
        assertEquals(ReportStatus.WATCHED, hostSummary.containers.first { it.name == "cont3" }.reportStatus)
        assertEquals(ReportStatus.NEW, hostSummary.containers.first { it.name == "cont4" }.reportStatus)
    }

    // TODO test sending alerts (mockito spy + check method calls)
//    @Test
//    fun checkForAlertSummary_SendingAlert_Test() {
//        // given
//        val hostSummary = loadMock("mocks/hostSummary1.json", HostSummary::class.java)
//        val pervHostSummary = loadMock("mocks/hostSummary2.json", HostSummary::class.java)
//        val host = loadMock("mocks/host1.json", Host::class.java)
//
//        // when
//        alertService.checkForAlertSummary(hostSummary, pervHostSummary, host)
//
//        // then
//
//    }
}