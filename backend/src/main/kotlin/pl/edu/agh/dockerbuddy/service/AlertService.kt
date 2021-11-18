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

    fun appendAlertTypeToMetrics(hostSummary: HostSummary, rules: MutableSet<MetricRule>){
        val hostMetrics = hostSummary.metrics.associateBy { it.metricType }
        for (rule in rules) {
            when (rule.type) {
                RuleType.CPU_USAGE -> addAlertType(hostMetrics[MetricType.CPU_USAGE]!!, rule)
                RuleType.MEMORY_USAGE -> addAlertType(hostMetrics[MetricType.MEMORY_USAGE]!!, rule)
                RuleType.DISK_USAGE -> addAlertType(hostMetrics[MetricType.DISK_USAGE]!!, rule)
            }
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
        checkForContainerAlerts(hostSummary, prevHostSummary.containers, host)
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

    fun checkForContainerAlerts(
        hostSummary: HostSummary,
        prevContainersSummaryList: List<ContainerSummary>,
        host: Host
    ) {
        val containerReportMap = host.containers.associateBy { it.containerName }
        val containerMap = hostSummary.containers.associateBy { it.id }
        val prevContainerMap = prevContainersSummaryList.associateBy { it.id }
        val newContainerList = mutableListOf<ContainerSummary>()
        for (cont in containerMap) {
            val containerSummary = cont.value
            if (containerReportMap[containerSummary.name]?.reportStatus == null) {
                if (containerSummary.id !in prevContainerMap.keys) {
                    sendAlert(
                        Alert(
                            hostSummary.id,
                            AlertType.WARN,
                            "Host ${host.hostName}: new container: ${containerSummary.name}"
                        )
                    )
                    containerSummary.reportStatus = ReportStatus.NEW
                    newContainerList.add(containerSummary)
                }
            } else {
                containerSummary.reportStatus = containerReportMap[containerSummary.name]?.reportStatus
            }
            if(prevContainerMap[containerSummary.id] != null) {
                if (containerReportMap[containerSummary.name]?.reportStatus == ReportStatus.WATCHED &&
                    containerSummary.alertType != prevContainerMap[containerSummary.id]?.alertType
                ) {
                    val alertMessage = if (containerSummary.alertType != AlertType.OK) {
                            "Host ${host.hostName}: something wrong with container ${containerSummary.name}. " +
                                    "State: ${containerSummary.status.humaneReadable()}"
                        } else {
                            "Host ${host.hostName}: container ${containerSummary.name} is back. " +
                                    "State: ${containerSummary.status.humaneReadable()}"
                        }
                    sendAlert(Alert(hostSummary.id, containerSummary.alertType!!, alertMessage))
                }
            } else if (containerSummary.alertType != AlertType.OK){
                val alertMessage: String = "Host ${host.hostName}: something wrong with container ${containerSummary.name}. " +
                                           "State: ${containerSummary.status.humaneReadable()}"
                sendAlert(Alert(hostSummary.id, containerSummary.alertType!!, alertMessage))
            }
        }
        hostService.addContainersToHost(host, newContainerList)
    }

    fun initialCheckForAlertSummary(hostSummary: HostSummary, host: Host) {
        logger.debug("Initial check for alerts")
        val reportsMap = host.containers.associateBy { it.containerName }
        val containerSummaryList = hostSummary.containers
        val newContainers = mutableListOf<ContainerSummary>()
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

        for (containerSummary in containerSummaryList) {
            if (containerSummary.name !in reportsMap.keys) {
                containerSummary.reportStatus = ReportStatus.NEW
                newContainers.add(containerSummary)
            }
        }
        checkForAlertSummary(hostSummary, mockPrevHostSummary, hostService.addContainersToHost(host, newContainers))
    }

    fun addAlertType(basicMetric: BasicMetric, rule: MetricRule) = when {
        basicMetric.percent < rule.warnLevel.toDouble() -> basicMetric.alertType = AlertType.OK
        basicMetric.percent > rule.criticalLevel.toDouble() -> basicMetric.alertType = AlertType.CRITICAL
        else -> basicMetric.alertType = AlertType.WARN
    }

    fun appendAlertTypeToContainers(hostSummary: HostSummary, host: Host) {
        val reports = host.containers.toList()
        val containers = hostSummary.containers
        val containerMap = containers.associateBy { it.name }
        for (report in reports) {
            if (report.reportStatus == ReportStatus.WATCHED) {
                if (report.containerName !in containerMap.keys) {
                    sendAlert(
                        Alert(
                            hostSummary.id,
                            AlertType.CRITICAL,
                            "Host ${host.hostName}: missing container ${report.containerName}"
                        )
                    )
                    continue
                }
                addAlertTypeToContainer(containerMap[report.containerName]!!)
            }
        }
        containers.forEach {
            it.alertType = if (it.alertType == null) AlertType.OK else it.alertType
        }
    }

    fun addAlertTypeToContainer(containerSummary: ContainerSummary) = when {
        ContainerState.RUNNING != containerSummary.status ->
            containerSummary.alertType = AlertType.CRITICAL
        else -> containerSummary.alertType = AlertType.OK
    }
}