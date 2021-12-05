package pl.edu.agh.dockerbuddy

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import pl.edu.agh.dockerbuddy.inmemory.InMemory
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.model.enums.ContainerState
import pl.edu.agh.dockerbuddy.model.metric.ContainerSummary
import pl.edu.agh.dockerbuddy.repository.HostRepository
import pl.edu.agh.dockerbuddy.service.HostService
import org.mockito.junit.jupiter.MockitoExtension
import pl.edu.agh.dockerbuddy.model.entity.ContainerReport
import pl.edu.agh.dockerbuddy.model.enums.ReportStatus
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import java.util.*

@ExtendWith(MockitoExtension::class)
class HostServiceTest {

    @Mock
    private lateinit var hostRepository: HostRepository

    @Mock
    private lateinit var inMemory: InMemory

    @InjectMocks
    private lateinit var hostService: HostService

    @Test
    fun getHostWithSummary_Test() {
        // given
        val host = loadMock("mocks/host1.json", Host::class.java)
        val hostId = host.id
        val hostSummary = loadMock("mocks/hostSummary1.json", HostSummary::class.java)

        // when
        `when`(hostRepository.findById(hostId!!)).thenReturn(Optional.of(host))
        `when`(inMemory.getHostSummary(hostId)).thenReturn(hostSummary)

        // then
        val hostWithSummary = hostService.getHostWithSummary(hostId)

        assertEquals(host.id, hostWithSummary.id)
        assertEquals(host.hostName, hostWithSummary.hostName)
        assertEquals(host.ip, hostWithSummary.ip)
        assertEquals(host.creationDate, hostWithSummary.creationDate)
        assertEquals(host.isTimedOut, hostWithSummary.isTimedOut)
        assertEquals(host.hostPercentRules.toList(), hostWithSummary.hostPercentRules)
        assertEquals(host.hostBasicRules.toList(), hostWithSummary.hostBasicRules)
        assertEquals(host.containers.toList(), hostWithSummary.containersReports)
        assertEquals(hostSummary, hostWithSummary.hostSummary)
    }

    @Test
    fun addContainersToHost_Test() {
        // given
        val host = Host("host", "1.1.1.1")
        val containerSummary1 = ContainerSummary(
            "cont-id",
            "cont1",
            "cont-image",
            ContainerState.RUNNING,
            listOf(),
            null,
            null
        )
        val containerSummary2 = ContainerSummary(
            "cont-id2",
            "cont2",
            "cont-image",
            ContainerState.RUNNING,
            listOf(),
            null,
            null
        )
        val containerSummary3 = ContainerSummary(
            "cont-id3",
            "cont3",
            "cont-image",
            ContainerState.RUNNING,
            listOf(),
            null,
            null
        )

        // when
        `when`(hostRepository.save(host)).thenReturn(host)
        val updatedHost = hostService.addContainersToHost(
            host, listOf(containerSummary1, containerSummary2, containerSummary3)
        )

        // then
        assertEquals(3, updatedHost.containers.size)
        assertEquals(1, updatedHost.containers.filter {
            it.containerName == containerSummary1.name && it.reportStatus == ReportStatus.NEW
        }.size)
        assertEquals(1, updatedHost.containers.filter {
            it.containerName == containerSummary2.name && it.reportStatus == ReportStatus.NEW
        }.size)
        assertEquals(1, updatedHost.containers.filter {
            it.containerName == containerSummary3.name && it.reportStatus == ReportStatus.NEW
        }.size)
    }

    @Test
    fun updateContainerReport_Test() {
        // given
        val host = Host("host", "1.1.1.1")
        val hostId = UUID.randomUUID()
        val containerReport0 = ContainerReport("cont",  ReportStatus.NOT_WATCHED)
        val containerReport1 = ContainerReport("cont1", ReportStatus.NEW)
        val containerReport2 = ContainerReport("cont1", ReportStatus.NOT_WATCHED)
        val containerReport3 = ContainerReport("cont1", ReportStatus.WATCHED)
        host.containers.add(containerReport0)
        host.containers.add(containerReport1)

        // when
        `when`(hostRepository.findById(hostId)).thenReturn(Optional.of(host))
        `when`(hostRepository.save(host)).thenReturn(host)

        // then
        var updatedHost = hostService.updateHostContainerReport(hostId, containerReport2)
        assertEquals(2, updatedHost.containers.size)
        assertEquals(1, updatedHost.containers.filter {
            it.containerName == containerReport0.containerName && it.reportStatus == ReportStatus.NOT_WATCHED
        }.size)
        assertEquals(1, updatedHost.containers.filter {
            it.containerName == containerReport2.containerName && it.reportStatus == ReportStatus.NOT_WATCHED
        }.size)

        updatedHost = hostService.updateHostContainerReport(hostId, containerReport3)
        assertEquals(2, updatedHost.containers.size)
        assertEquals(1, updatedHost.containers.filter {
            it.containerName == containerReport3.containerName && it.reportStatus == ReportStatus.WATCHED
        }.size)
    }
}