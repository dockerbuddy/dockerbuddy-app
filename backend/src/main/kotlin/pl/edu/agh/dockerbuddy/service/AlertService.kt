package pl.edu.agh.dockerbuddy.service

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service
import pl.edu.agh.dockerbuddy.influxdb.InfluxDbProxy
import pl.edu.agh.dockerbuddy.model.alert.Alert
import pl.edu.agh.dockerbuddy.model.alert.AlertType
import pl.edu.agh.dockerbuddy.model.enums.ContainerState
import pl.edu.agh.dockerbuddy.model.enums.RuleType
import pl.edu.agh.dockerbuddy.model.entity.ContainerRule
import pl.edu.agh.dockerbuddy.model.entity.MetricRule
import pl.edu.agh.dockerbuddy.model.metric.BasicMetric
import pl.edu.agh.dockerbuddy.model.metric.ContainerSummary
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import pl.edu.agh.dockerbuddy.model.metric.MetricType
import java.util.*

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

    fun checkForAlertSummary(hostSummary: HostSummary, prevHostSummary: HostSummary, hostName: String){
        val hostMetrics = hostSummary.metrics.associateBy { it.metricType }
        val prevHostMetrics = prevHostSummary.metrics.associateBy { it.metricType }
        for (mt in MetricType.values()) {
            if (hostMetrics.containsKey(mt) && prevHostMetrics.containsKey(mt)) {
                checkForAlert(hostMetrics[mt]!!, prevHostMetrics[mt]!!, hostSummary, hostName)
            }
            else {
                logger.warn("Missing metric $mt for host $hostName")
            }
        }
        checkForAlerts(hostSummary.containers, prevHostSummary.containers, hostSummary, hostName)
    }

    fun checkForAlert(
        basicMetric: BasicMetric,
        prevBasicMetric: BasicMetric,
        hostSummary: HostSummary,
        hostName: String
    ) {
        if (basicMetric.alertType == null) return
        logger.debug("Checking basic metric: ${basicMetric.metricType}")
        if (basicMetric.alertType != prevBasicMetric.alertType) {
            val alertMessage = "Host $hostName: ${basicMetric.metricType.humanReadable()} is ${basicMetric.percent}%"
            logger.info(alertMessage)
            logger.debug("$basicMetric")
            sendAlert(Alert(hostSummary.id, basicMetric.alertType!!, alertMessage))
        }
    }

    fun checkForAlerts(
        containersSummaries: List<ContainerSummary>,
        prevContainersSummaries: List<ContainerSummary>,
        hostSummary: HostSummary,
        hostName: String
    ) {
        val containers = containersSummaries.associateBy { it.id }
        val prevContainers = prevContainersSummaries.associateBy { it.id }
        for (cont in containers) {
            if (cont.key !in prevContainers.keys) {
                sendAlert(
                    Alert(
                    hostSummary.id,
                    AlertType.WARN,
                    "Host $hostName: new container: ${cont.value.name}"
                )
                )
            }
            val container = cont.value
            if (container.alertType != prevContainers[container.id]!!.alertType){
                val alertMessage = "Host $hostName: something wrong with container ${container.name}. " +
                        "State: ${container.status.humaneReadable()}"
                sendAlert(Alert(hostSummary.id, container.alertType!!, alertMessage))
            }
        }
    }

    fun initialCheckForAlertSummary(hostSummary: HostSummary, hostName: String) {
        logger.debug("Initial check for alerts")
        val mockPrevHostSummary = HostSummary(
            UUID.randomUUID(),
            "123",
            listOf(
                BasicMetric(MetricType.CPU_USAGE, 0.0, 0.0, 0.0, AlertType.OK),
                BasicMetric(MetricType.DISK_USAGE, 0.0, 0.0, 0.0, AlertType.OK),
                BasicMetric(MetricType.MEMORY_USAGE, 0.0, 0.0, 0.0, AlertType.OK)
            ),
            hostSummary.containers.toMutableList()
        )
        mockPrevHostSummary.containers.map { it.copy() }.forEach { it.alertType = AlertType.OK }

        checkForAlertSummary(hostSummary, mockPrevHostSummary, hostName)
    }

    fun appendAlertTypeToMetrics(hostSummary: HostSummary, rules: MutableSet<MetricRule>){
        val hostMetrics = hostSummary.metrics.associateBy { it.metricType }
        for (rule in rules) {
            when (rule.type) {
                RuleType.CPU_USAGE -> addAlertType(hostMetrics[MetricType.CPU_USAGE]!!, rule)
                RuleType.MEMORY_USAGE -> addAlertType(hostMetrics[MetricType.MEMORY_USAGE]!!, rule)
                RuleType.DISK_USAGE -> addAlertType(hostMetrics[MetricType.DISK_USAGE]!!, rule)
                else -> continue
            }
        }

        hostSummary.containers.map { if (it.alertType == null) it.alertType = AlertType.OK }
    }

    fun addAlertType(basicMetric: BasicMetric, rule: MetricRule) = when {
        basicMetric.percent < rule.warnLevel.toDouble() -> basicMetric.alertType = AlertType.OK
        basicMetric.percent > rule.criticalLevel.toDouble() -> basicMetric.alertType = AlertType.CRITICAL
        else -> basicMetric.alertType = AlertType.WARN
    }

    fun appendAlertTypeToContainers(hostSummary: HostSummary, rules: List<ContainerRule>, hostName: String) {
        val containers = hostSummary.containers
        val containerMap = containers.associateBy { it.name }
        for (rule in rules) {
            if (rule.containerName !in containerMap.keys) {
                sendAlert(
                    Alert(
                        hostSummary.id,
                        AlertType.CRITICAL,
                        "Host $hostName: missing container ${rule.containerName}"
                    )
                )
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
        ContainerState.RUNNING != containerSummary.status ->
            containerSummary.alertType = rule.alertType
        else -> containerSummary.alertType = AlertType.OK
    }
}