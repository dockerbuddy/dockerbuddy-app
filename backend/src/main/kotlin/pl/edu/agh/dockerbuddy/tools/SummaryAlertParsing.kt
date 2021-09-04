package pl.edu.agh.dockerbuddy.tools

import pl.edu.agh.dockerbuddy.model.AlertType
import pl.edu.agh.dockerbuddy.model.RuleType
import pl.edu.agh.dockerbuddy.model.entity.AbstractRule
import pl.edu.agh.dockerbuddy.model.metric.BasicMetric
import pl.edu.agh.dockerbuddy.model.metric.HostSummary

fun appendAlertTypeToMetrics(hostSummary: HostSummary, rules: MutableList<AbstractRule>){
    for (rule in rules) {
        when (rule.type) {
            RuleType.CpuUsage -> addAlertType(hostSummary.cpuUsage, rule)
            RuleType.MemoryUsage -> addAlertType(hostSummary.memoryUsage, rule)
            RuleType.DiskUsage -> addAlertType(hostSummary.diskUsage, rule)
        }
    }
}

fun addAlertType(basicMetric: BasicMetric, rule: AbstractRule) = when {
    basicMetric.percent * 100 < rule.warnLevel.toDouble() -> basicMetric.alertType = AlertType.OK
    basicMetric.percent * 100 > rule.criticalLevel.toDouble() -> basicMetric.alertType = AlertType.CRITICAL
    else -> basicMetric.alertType = AlertType.WARN
}