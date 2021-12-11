package pl.edu.agh.dockerbuddy.model

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import pl.edu.agh.dockerbuddy.model.entity.ContainerReport
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.model.entity.PercentMetricRule
import pl.edu.agh.dockerbuddy.model.enums.ReportStatus
import pl.edu.agh.dockerbuddy.model.enums.PercentMetricType
import pl.edu.agh.dockerbuddy.repository.HostRepository

@DataJpaTest
@AutoConfigureTestDatabase
class PersistenceTest (
    @Autowired val hostRepository: HostRepository
) {
    @Test
    fun `saving host`() {
        val host = Host("host", "192.168.1.55")
        hostRepository.save(host)
        assertEquals(host, hostRepository.findAll().first())
    }

    @Test
    fun `saving metricRule`() {
        val host = Host("host", "192.168.1.55")
        val metricRule = PercentMetricRule(PercentMetricType.DISK_USAGE, 50, 90)
        host.hostPercentRules.add(metricRule)
        hostRepository.save(host)
        assertEquals(metricRule, hostRepository.findAll().first().hostPercentRules.first())
    }

    @Test
    fun `saving containerReports`() {
        val host = Host("host", "192.168.1.55")
        val containerReport = ContainerReport("cont1", ReportStatus.NEW)
        host.containers.add(containerReport)
        hostRepository.save(host)
        assertEquals(containerReport, hostRepository.findAll().first().containers.first())
    }
}