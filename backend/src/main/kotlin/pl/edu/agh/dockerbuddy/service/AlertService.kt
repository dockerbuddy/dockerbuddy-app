package pl.edu.agh.dockerbuddy.service

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service
import pl.edu.agh.dockerbuddy.influxdb.InfluxDbProxy
import pl.edu.agh.dockerbuddy.model.Alert
import pl.edu.agh.dockerbuddy.model.AlertType
import pl.edu.agh.dockerbuddy.model.ContainerStateType
import pl.edu.agh.dockerbuddy.model.RuleType
import pl.edu.agh.dockerbuddy.model.entity.ContainerRule
import pl.edu.agh.dockerbuddy.model.entity.MetricRule
import pl.edu.agh.dockerbuddy.model.metric.BasicMetric
import pl.edu.agh.dockerbuddy.model.metric.ContainerSummary
import pl.edu.agh.dockerbuddy.model.metric.HostSummary

@Service
class AlertService(val template: SimpMessagingTemplate, val influxDbProxy: InfluxDbProxy) {
    private val logger = LoggerFactory.getLogger(AlertService::class.java)

    fun sendAlert(alert: Alert) {
        logger.info("Sending alert...")
        template.convertAndSend("/alerts", alert)
        CoroutineScope(Dispatchers.IO).launch {
            influxDbProxy.saveAlert(alert)
        }
    }

    fun checkForAlertSummary(hostSummary: HostSummary, prevHostSummary: HostSummary){
        checkForAlert(hostSummary.diskUsage, prevHostSummary.diskUsage, hostSummary, "disk usage")
        checkForAlert(hostSummary.cpuUsage, prevHostSummary.cpuUsage, hostSummary, "cpu usage")
        checkForAlert(hostSummary.memoryUsage, prevHostSummary.memoryUsage, hostSummary, "memory usage")
        checkForAlerts(hostSummary.containers, prevHostSummary.containers, hostSummary)
    }

    fun checkForAlert(basicMetric: BasicMetric, prevBasicMetric: BasicMetric, hostSummary: HostSummary, metricName: String){
        if (basicMetric.alertType == null) return
        logger.debug("Checking basic metric: $metricName")
        if (basicMetric.alertType != prevBasicMetric.alertType) {
            val alertMessage = "Host ${hostSummary.id}: $metricName is ${basicMetric.percent}%"
            logger.info(alertMessage)
            logger.debug("$basicMetric")
            sendAlert(Alert(hostSummary.id, basicMetric.alertType!!, alertMessage))
        }
    }

    fun checkForAlerts(containersSummaries: List<ContainerSummary>, prevContainersSummaries: List<ContainerSummary>, hostSummary: HostSummary) {
        val containers = containersSummaries.associateBy { it.id }
        val prevContainers = prevContainersSummaries.associateBy { it.id }
        for (cont in containers) {
            if (cont.key !in prevContainers.keys) {
                sendAlert(
                    Alert(
                    hostSummary.id,
                    AlertType.WARN,
                    "Host ${hostSummary.id}: new container: ${cont.value.name}"
                ))
            }
            val container = cont.value
            if (container.alertType != prevContainers[container.id]!!.alertType){
                val alertMessage = "Host ${hostSummary.id}: something wrong with container ${container.id}"
                sendAlert(Alert(hostSummary.id, container.alertType!!, alertMessage))
            }
        }
    }

    fun initialCheckForAlertSummary(hostSummary: HostSummary) {
        logger.debug("Initial check for alerts")
        val mockPrevHostSummary = HostSummary(
            -1,
            "123",
            BasicMetric(0.0, 0.0, 0.0, AlertType.OK),
            BasicMetric(0.0, 0.0, 0.0, AlertType.OK),
            BasicMetric(0.0, 0.0, 0.0, AlertType.OK),
            hostSummary.containers.toMutableList()
        )
        mockPrevHostSummary.containers.map { it.copy() }.forEach { it.alertType = AlertType.OK }

        checkForAlertSummary(hostSummary, mockPrevHostSummary)
    }

    fun appendAlertTypeToMetrics(hostSummary: HostSummary, rules: MutableSet<MetricRule>){
        for (rule in rules) {
            when (rule.type) {
                RuleType.CpuUsage -> addAlertType(hostSummary.cpuUsage, rule)
                RuleType.MemoryUsage -> addAlertType(hostSummary.memoryUsage, rule)
                RuleType.DiskUsage -> addAlertType(hostSummary.diskUsage, rule)
                else -> continue
            }
        }
        hostSummary.containers.forEach {
            if (it.alertType == null) {
                it.alertType = AlertType.OK
            }
        }
    }

    fun addAlertType(basicMetric: BasicMetric, rule: MetricRule) = when {
        basicMetric.percent < rule.warnLevel.toDouble() -> basicMetric.alertType = AlertType.OK
        basicMetric.percent > rule.criticalLevel.toDouble() -> basicMetric.alertType = AlertType.CRITICAL
        else -> basicMetric.alertType = AlertType.WARN
    }

    fun appendAlertTypeToContainers(hostSummary: HostSummary, rules: List<ContainerRule>) {
        val containers = hostSummary.containers
        val containerMap = containers.associateBy { it.name }
        for (rule in rules) {
            if (rule.containerName !in containerMap.keys) {
                sendAlert(Alert(
                    hostSummary.id,
                    AlertType.CRITICAL,
                    "Host ${hostSummary.id}: missing container ${rule.containerName}"
                ))
            }
            addAlertTypeToContainer(containerMap[rule.containerName]!!, rule)
        }
        containers.forEach {
            if (it.alertType == null) {
                it.alertType = AlertType.OK
            }
        }
    }

    fun addAlertTypeToContainer(containerSummary: ContainerSummary, rule: ContainerRule) = when {
        containerSummary.status != ContainerStateType.RUNNING.state -> containerSummary.alertType = rule.alertType
        else -> containerSummary.alertType = AlertType.OK
    }

}