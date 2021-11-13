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
import pl.edu.agh.dockerbuddy.model.alert.AlertWithCounter
import pl.edu.agh.dockerbuddy.model.enums.ContainerState
import pl.edu.agh.dockerbuddy.model.enums.RuleType
import pl.edu.agh.dockerbuddy.model.entity.ContainerReport
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.model.entity.MetricRule
import pl.edu.agh.dockerbuddy.model.enums.ReportStatus
import pl.edu.agh.dockerbuddy.model.metric.BasicMetric
import pl.edu.agh.dockerbuddy.model.metric.ContainerSummary
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import pl.edu.agh.dockerbuddy.model.metric.MetricType
import java.util.*

@Service
class AlertService(
    val template: SimpMessagingTemplate,
    val influxDbProxy: InfluxDbProxy,
    val hostService: HostService
) {
    private val logger = LoggerFactory.getLogger(AlertService::class.java)

    fun sendAlert(alert: Alert) {
        logger.info("Sending alert...")
        influxDbProxy.alertCounter += 1
        template.convertAndSend("/alerts", AlertWithCounter(alert, influxDbProxy.alertCounter))
        CoroutineScope(Dispatchers.IO).launch {
            influxDbProxy.saveAlert(alert)
        }
    }

    fun checkForAlertSummary(hostSummary: HostSummary, prevHostSummary: HostSummary, host: Host){
        val hostMetrics = hostSummary.metrics.associateBy { it.metricType }
        val prevHostMetrics = prevHostSummary.metrics.associateBy { it.metricType }
        for (mt in MetricType.values()) {
            if (hostMetrics.containsKey(mt) && prevHostMetrics.containsKey(mt)) {
                checkForAlert(hostMetrics[mt]!!, prevHostMetrics[mt]!!, hostSummary, host.hostName!!)
            }
            else {
                logger.warn("Missing metric $mt for host ${host.hostName}")
            }
        }
        checkForAlerts(hostSummary.containers, prevHostSummary.containers, hostSummary, host)
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
        host: Host
    ) {
        val containers = containersSummaries.associateBy { it.id }
        val prevContainers = prevContainersSummaries.associateBy { it.id }
        val newContainers = mutableListOf<ContainerSummary>()
        for (cont in containers) {
            if (cont.key !in prevContainers.keys) {
                sendAlert(
                    Alert(
                        hostSummary.id,
                        AlertType.WARN,
                        "Host ${host.hostName}: new container: ${cont.value.name}"
                    )
                )
                newContainers.add(cont.value)
            }
            hostService.addContainersToHost(host, newContainers)
            val container = cont.value
            if(prevContainers[container.id] != null) {
                if (container.alertType != prevContainers[container.id]!!.alertType) {
                    val alertMessage: String = if (container.alertType != AlertType.OK) {
                        "Host ${host.hostName}: something wrong with container ${container.name}. " +
                                "State: ${container.status.humaneReadable()}"
                    } else {
                        "Host ${host.hostName}: container ${container.name} is back. " +
                                "State: ${container.status.humaneReadable()}"
                    }
                    sendAlert(Alert(hostSummary.id, container.alertType!!, alertMessage))
                }
            } else if (container.alertType != AlertType.OK){
                val alertMessage: String = "Host ${host.hostName}: something wrong with container ${container.name}. " +
                                           "State: ${container.status.humaneReadable()}"
                sendAlert(Alert(hostSummary.id, container.alertType!!, alertMessage))
            }
        }
    }

    fun initialCheckForAlertSummary(hostSummary: HostSummary, host: Host) {
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

        checkForAlertSummary(hostSummary, mockPrevHostSummary, host)
    }

    fun appendAlertTypeToMetrics(hostSummary: HostSummary, rules: MutableSet<MetricRule>){
        val hostMetrics = hostSummary.metrics.associateBy { it.metricType }
        for (rule in rules) {
            when (rule.type) {
                RuleType.CPU_USAGE -> addAlertType(hostMetrics[MetricType.CPU_USAGE]!!, rule)
                RuleType.MEMORY_USAGE -> addAlertType(hostMetrics[MetricType.MEMORY_USAGE]!!, rule)
                RuleType.DISK_USAGE -> addAlertType(hostMetrics[MetricType.DISK_USAGE]!!, rule)
            }
        }

        hostSummary.containers.map { if (it.alertType == null) it.alertType = AlertType.OK }
    }

    fun addAlertType(basicMetric: BasicMetric, rule: MetricRule) = when {
        basicMetric.percent < rule.warnLevel.toDouble() -> basicMetric.alertType = AlertType.OK
        basicMetric.percent > rule.criticalLevel.toDouble() -> basicMetric.alertType = AlertType.CRITICAL
        else -> basicMetric.alertType = AlertType.WARN
    }

    fun appendAlertTypeToContainers(hostSummary: HostSummary, rules: List<ContainerReport>, hostName: String) {
        val containers = hostSummary.containers
        val containerMap = containers.associateBy { it.name }
        for (rule in rules) {
            if (rule.reportStatus == ReportStatus.WATCHED) {
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
        }
        containers.forEach {
            it.alertType = if (it.alertType == null) AlertType.OK else it.alertType
        }
    }

    fun addAlertTypeToContainer(containerSummary: ContainerSummary, rule: ContainerReport) = when {
        ContainerState.RUNNING != containerSummary.status ->
            containerSummary.alertType = AlertType.CRITICAL
        else -> containerSummary.alertType = AlertType.OK
    }
}