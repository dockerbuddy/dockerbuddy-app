package pl.edu.agh.dockerbuddy.tools

import pl.edu.agh.dockerbuddy.model.AlertType
import pl.edu.agh.dockerbuddy.model.RuleType
import pl.edu.agh.dockerbuddy.model.entity.AbstractRule
import pl.edu.agh.dockerbuddy.model.metric.BasicMetric
import pl.edu.agh.dockerbuddy.model.metric.HostSummary

fun addAlertsToSummary(hostSummary: HostSummary, rules: MutableList<AbstractRule>){
    for (rule in rules) {
        when (rule.type) {
            RuleType.CpuUsage -> applyAlertType(hostSummary.cpuUsage, rule)
            RuleType.MemoryUsage -> applyAlertType(hostSummary.memoryUsage, rule)
            RuleType.DiskUsage -> applyAlertType(hostSummary.diskUsage, rule)
        }
    }
}

fun applyAlertType(basicMetric: BasicMetric, rule: AbstractRule) = when {
    basicMetric.percent * 100 < rule.warnLevel.toDouble() -> basicMetric.alertType = AlertType.OK
    basicMetric.percent * 100 > rule.criticalLevel.toDouble() -> basicMetric.alertType = AlertType.CRITICAL
    else -> basicMetric.alertType = AlertType.WARN
}