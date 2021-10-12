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
        }
    }
}

fun addAlertType(basicMetric: BasicMetric, rule: MetricRule) = when {
    basicMetric.percent * 100 < rule.warnLevel.toDouble() -> basicMetric.alertType = AlertType.OK
    basicMetric.percent * 100 > rule.criticalLevel.toDouble() -> basicMetric.alertType = AlertType.CRITICAL
    else -> basicMetric.alertType = AlertType.WARN
}

fun checkForAlertSummary(hostSummary: HostSummary, prevHostSummary: HostSummary){
    checkForAlert(hostSummary.diskUsage, prevHostSummary.diskUsage)
    checkForAlert(hostSummary.cpuUsage, prevHostSummary.cpuUsage)
    checkForAlert(hostSummary.memoryUsage, prevHostSummary.memoryUsage)
    checkForAlerts(hostSummary.containers, prevHostSummary.containers)
}

fun checkForAlert(basicMetric: BasicMetric, prevBasicMetric: BasicMetric){
    basicMetric.alert = basicMetric.alertType != prevBasicMetric.alertType
}

fun checkForAlerts(containersSummaries: List<ContainerSummary>, prevContainersSummaries: List<ContainerSummary>) {
    val containers = containersSummaries.associateBy { it.id }
    val prevContainers = prevContainersSummaries.associateBy { it.id }
    for (cont in containers) {
        if (cont.key !in prevContainers.keys) continue // TODO case when there's new container -> AlertType.NewCont ?
        val container = cont.value
        container.alert = container.alertType != prevContainers[container.id]!!.alertType
    }
}

fun appendAlertTypeToContainers(containers: List<ContainerSummary>, rules: List<ContainerRule>) {
    val containerMap = containers.associateBy { it.name }
    for (rule in rules) {
        if (rule.containerName !in containerMap.keys) {
            // TODO case when such container does not exist -> additional alerts in form of messages?
        } else {
            addAlertTypeToContainer(containerMap[rule.containerName]!!, rule)
        }
    }
}

fun addAlertTypeToContainer(containerSummary: ContainerSummary, rule: ContainerRule) = when {
    containerSummary.status != "running" -> containerSummary.alertType = rule.alertType
    else -> containerSummary.alertType = AlertType.OK
}