package pl.edu.agh.dockerbuddy.service

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import pl.edu.agh.dockerbuddy.model.RuleType
import pl.edu.agh.dockerbuddy.model.entity.AbstractRule
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import pl.edu.agh.dockerbuddy.repository.HostRepository
import pl.edu.agh.dockerbuddy.tools.addAlertsToSummary
import javax.annotation.PostConstruct
import javax.persistence.EntityNotFoundException

@Service
class MetricService(
        @Autowired val hostRepository: HostRepository
) {

    fun postMetric(hostSummary: HostSummary, hostId: Long){
        val host: Host = hostRepository.findByIdOrNull(hostId) ?: throw EntityNotFoundException()
        addAlertsToSummary(hostSummary, host.rules)
        println(hostSummary)
    }

    @PostConstruct
    fun mockData(){
        val host = Host(hostName = "name")
        val abstractRuleCpu = AbstractRule(type = RuleType.CpuUsage,
                warnLevel = 40,
                criticalLevel = 70,
                host = host)

        val abstractRuleMem = AbstractRule(type = RuleType.MemoryUsage,
                warnLevel = 40,
                criticalLevel = 70,
                host = host)

        val abstractRuleDisk = AbstractRule(type = RuleType.DiskUsage,
                warnLevel = 40,
                criticalLevel = 70,
                host = host)

        val rules: MutableList<AbstractRule> = mutableListOf(abstractRuleCpu, abstractRuleDisk, abstractRuleMem)
        host.rules = rules
        hostRepository.save(host)
    }
}