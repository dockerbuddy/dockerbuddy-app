package pl.edu.agh.dockerbuddy.tools

import pl.edu.agh.dockerbuddy.model.AlertType
import pl.edu.agh.dockerbuddy.model.RuleType
import pl.edu.agh.dockerbuddy.model.entity.MetricRule
import pl.edu.agh.dockerbuddy.model.metric.BasicMetric
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
}

fun checkForAlert(basicMetric: BasicMetric, prevBasicMetric: BasicMetric){
    basicMetric.alert = basicMetric.alertType != prevBasicMetric.alertType
}
