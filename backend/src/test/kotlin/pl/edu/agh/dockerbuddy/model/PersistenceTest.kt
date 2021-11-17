package pl.edu.agh.dockerbuddy.model

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import pl.edu.agh.dockerbuddy.model.entity.ContainerReport
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.model.entity.MetricRule
import pl.edu.agh.dockerbuddy.model.enums.ReportStatus
import pl.edu.agh.dockerbuddy.model.enums.RuleType
import pl.edu.agh.dockerbuddy.repository.HostRepository

@DataJpaTest
@AutoConfigureTestDatabase
class PersistenceTest (
    @Autowired val hostRepository: HostRepository
) {
    @Test
    fun saveHost_Test() {
        val host = Host("host", "192.168.1.55")
        hostRepository.save(host)
        assertEquals(host, hostRepository.findAll().first())
    }

    @Test
    fun saveMetricRule_Test() {
        val host = Host("host", "192.168.1.55")
        val metricRule = MetricRule(RuleType.DISK_USAGE, 50, 90)
        host.hostRules.add(metricRule)
        hostRepository.save(host)
        assertEquals(metricRule, hostRepository.findAll().first().hostRules.first())
    }

    @Test
    fun saveContainers_Test() {
        val host = Host("host", "192.168.1.55")
        val containerReport = ContainerReport("cont1", ReportStatus.NEW)
        host.containers.add(containerReport)
        hostRepository.save(host)
        assertEquals(containerReport, hostRepository.findAll().first().containers.first())
    }
}