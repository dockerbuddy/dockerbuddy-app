package pl.edu.agh.dockerbuddy

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.*
import org.springframework.messaging.simp.SimpMessagingTemplate
import pl.edu.agh.dockerbuddy.influxdb.InfluxDbProxy
import pl.edu.agh.dockerbuddy.model.alert.Alert
import pl.edu.agh.dockerbuddy.model.alert.AlertType
import pl.edu.agh.dockerbuddy.model.alert.AlertWithCounter
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
    fun setMetricsAlertType_Test() {
        // given
        val hostSummary = loadMock("mocks/hostSummary1.json", HostSummary::class.java)
        val host = loadMock("mocks/host1.json", Host::class.java)
        val hostPercentRules = host.hostPercentRules
        val hostBasicRules = host.hostBasicRules

        // when
        alertService.setMetricsAlertType(hostSummary, hostPercentRules, hostBasicRules)

        // then
        assertEquals(AlertType.CRITICAL, hostSummary.percentMetrics.first { it.metricType == PercentMetricType.CPU_USAGE }.alertType)
        assertEquals(AlertType.WARN, hostSummary.percentMetrics.first { it.metricType == PercentMetricType.MEMORY_USAGE }.alertType)
        assertEquals(AlertType.OK, hostSummary.percentMetrics.first { it.metricType == PercentMetricType.DISK_USAGE }.alertType)
        assertEquals(AlertType.CRITICAL, hostSummary.basicMetrics.first { it.metricType == BasicMetricType.NETWORK_IN }.alertType)
        assertEquals(AlertType.OK, hostSummary.basicMetrics.first { it.metricType == BasicMetricType.NETWORK_OUT }.alertType)
    }

    @Test
    fun setContainersAlertType_Test() {
        // given
        val hostSummary = loadMock("mocks/hostSummary1.json", HostSummary::class.java)
        val prevHostSummary = loadMock("mocks/hostSummary2.json", HostSummary::class.java)
        val host = loadMock("mocks/host1.json", Host::class.java)

        // when
        alertService.setContainersAlertType(hostSummary, prevHostSummary, host)

        // then
        assertEquals(AlertType.OK, hostSummary.containers.first { it.name == "cont1" }.alertType)
        assertEquals(AlertType.OK, hostSummary.containers.first { it.name == "cont2" }.alertType)
        assertEquals(AlertType.CRITICAL, hostSummary.containers.first { it.name == "cont3" }.alertType)
    }

    @Test
    fun `add new container to reports and set proper reportStatuses`() {
        // given
        val hostSummary = loadMock("mocks/hostSummary2.json", HostSummary::class.java)
        val prevHostSummary = loadMock("mocks/hostSummary1.json", HostSummary::class.java)
        val host = loadMock("mocks/host1.json", Host::class.java)
        val alert1 = Alert(
            hostSummary.id,
            AlertType.OK,
            "Host ${host.hostName}: new container: cont4"
        )

        // when
        alertService.setContainersAlertType(hostSummary, prevHostSummary, host)
        alertService.checkForAlertSummary(hostSummary, prevHostSummary, host)

        // then
        assertEquals(ReportStatus.NOT_WATCHED, hostSummary.containers.first { it.name == "cont1" }.reportStatus)
        assertEquals(ReportStatus.NEW, hostSummary.containers.first { it.name == "cont2" }.reportStatus)
        assertEquals(ReportStatus.WATCHED, hostSummary.containers.first { it.name == "cont3" }.reportStatus)
        assertEquals(ReportStatus.NEW, hostSummary.containers.first { it.name == "cont4" }.reportStatus)

        // verify sendAlert calls
        verify(hostService, times(1))
            .addContainersToHost(eq(host), eq(mutableListOf(hostSummary.containers.find { it.name == "cont4" }!!)))
        verify(template, times(1)).convertAndSend(eq("/alerts"), eq(AlertWithCounter(alert1, 0)))

    }

    @Test
    fun initialCheckForAlertSummary_UpdateContainerReportStatus_Test() {
        // given
        val hostSummary = loadMock("mocks/hostSummary1.json", HostSummary::class.java)
        val host = loadMock("mocks/host1.json", Host::class.java)

        // when
        alertService.initialCheckForAlertSummary(hostSummary, host)

        // then
        assertEquals(ReportStatus.NOT_WATCHED, hostSummary.containers.first { it.name == "cont1" }.reportStatus)
        assertEquals(ReportStatus.NEW, hostSummary.containers.first { it.name == "cont2" }.reportStatus)
        assertEquals(ReportStatus.WATCHED, hostSummary.containers.first { it.name == "cont3" }.reportStatus)
    }

    @Test
    fun initialCheckForAlertSummary_Test() {
        // given
        val hostSummary = loadMock("mocks/hostSummary1.json", HostSummary::class.java)
        val host = loadMock("mocks/host1.json", Host::class.java)
        val alertMessage = "Host ${host.hostName}: something wrong with container cont3. State: exited"
        val alert = Alert(hostSummary.id, AlertType.CRITICAL, alertMessage)

        // when
        alertService.setContainersAlertType(hostSummary, null, host)
        alertService.initialCheckForAlertSummary(hostSummary, host)

        // then
        assertEquals(ReportStatus.NOT_WATCHED, hostSummary.containers.first { it.name == "cont1" }.reportStatus)
        assertEquals(ReportStatus.NEW, hostSummary.containers.first { it.name == "cont2" }.reportStatus)
        assertEquals(ReportStatus.WATCHED, hostSummary.containers.first { it.name == "cont3" }.reportStatus)
        assertEquals(AlertType.OK, hostSummary.containers.first { it.name == "cont1" }.alertType)
        assertEquals(AlertType.OK, hostSummary.containers.first { it.name == "cont2" }.alertType)
        assertEquals(AlertType.CRITICAL, hostSummary.containers.first { it.name == "cont3" }.alertType)

        // verify sendAlert calls
        verify(template, times(1))
            .convertAndSend(eq("/alerts"), eq(AlertWithCounter(alert, 0)))
    }

    @Test
    fun `send alert when watched container's status is exited`() {
        // given
        val hostSummary1 = loadMock("mocks/hostSummary1.json", HostSummary::class.java)
        val hostSummary2 = loadMock("mocks/hostSummary2.json", HostSummary::class.java)
        val host = loadMock("mocks/host1.json", Host::class.java)
        val alert = Alert(
            hostSummary2.id,
            AlertType.CRITICAL,
            "Host ${host.hostName}: something wrong with container cont3. " +
                    "State: exited"
        )

        // when
        alertService.setContainersAlertType(hostSummary2, hostSummary1, host)
        alertService.checkForAlertSummary(hostSummary2, hostSummary1, host)

        // then
        verify(template, times(1)).convertAndSend(eq("/alerts"), eq(AlertWithCounter(alert, 0)))
    }

    /*
    TODO
     - alert for missing container
     - alert for container that is back online
    */
}