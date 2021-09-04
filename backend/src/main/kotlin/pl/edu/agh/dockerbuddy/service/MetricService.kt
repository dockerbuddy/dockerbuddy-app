package pl.edu.agh.dockerbuddy.service

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import pl.edu.agh.dockerbuddy.model.RuleType
import pl.edu.agh.dockerbuddy.model.entity.AbstractRule
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import pl.edu.agh.dockerbuddy.repository.HostRepository
import pl.edu.agh.dockerbuddy.tools.appendAlertTypeToMetrics
import javax.annotation.PostConstruct
import javax.persistence.EntityNotFoundException

@Service
class MetricService(
        @Autowired val hostRepository: HostRepository
) {

    fun postMetric(hostSummary: HostSummary, hostId: Long){
        val host: Host = hostRepository.findByIdOrNull(hostId) ?: throw EntityNotFoundException()
        appendAlertTypeToMetrics(hostSummary, host.rules)
        println(hostSummary)
    }
}