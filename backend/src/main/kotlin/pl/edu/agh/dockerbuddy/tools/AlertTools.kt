package pl.edu.agh.dockerbuddy.tools

import pl.edu.agh.dockerbuddy.model.AlertType
import pl.edu.agh.dockerbuddy.model.RuleType
import pl.edu.agh.dockerbuddy.model.entity.ContainerRule
import pl.edu.agh.dockerbuddy.model.entity.MetricRule
import pl.edu.agh.dockerbuddy.model.metric.BasicMetric
import pl.edu.agh.dockerbuddy.model.metric.ContainerSummary
import pl.edu.agh.dockerbuddy.model.metric.HostSummary

fun appendAlertTypeToMetrics(hostSummary: HostSummary, rules: MutableSet<MetricRule>){
    for (rule in rules) {
        when (rule.type) {
            RuleType.CpuUsage -> addAlertType(hostSummary.cpuUsage, rule)
            RuleType.MemoryUsage -> addAlertType(hostSummary.memoryUsage, rule)
            RuleType.DiskUsage -> addAlertType(hostSummary.diskUsage, rule)
            else -> break
        }
    }
}

fun addAlertType(basicMetric: BasicMetric, rule: MetricRule) = when {
    basicMetric.percent < rule.warnLevel.toDouble() -> basicMetric.alertType = AlertType.OK
    basicMetric.percent > rule.criticalLevel.toDouble() -> basicMetric.alertType = AlertType.CRITICAL
    else -> basicMetric.alertType = AlertType.WARN
}

fun appendAlertTypeToContainers(containers: List<ContainerSummary>, rules: List<ContainerRule>) {
    val containerMap = containers.associateBy { it.name }
    for (rule in rules) {
        if (rule.containerName !in containerMap.keys) continue // TODO case when such container does not exist -> additional alerts in form of messages?
        addAlertTypeToContainer(containerMap[rule.containerName]!!, rule)
    }
}

fun addAlertTypeToContainer(containerSummary: ContainerSummary, rule: ContainerRule) = when {
    containerSummary.status != "running" -> containerSummary.alertType = rule.alertType
    else -> containerSummary.alertType = AlertType.OK
}