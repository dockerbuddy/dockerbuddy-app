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
import pl.edu.agh.dockerbuddy.model.entity.BasicMetricRule
import pl.edu.agh.dockerbuddy.model.enums.ContainerState
import pl.edu.agh.dockerbuddy.model.enums.RuleType
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.model.entity.PercentMetricRule
import pl.edu.agh.dockerbuddy.model.enums.ReportStatus
import pl.edu.agh.dockerbuddy.model.metric.*
import java.util.*

@Service
class AlertService(
    val template: SimpMessagingTemplate,
    val influxDbProxy: InfluxDbProxy,
    val hostService: HostService
) {
    private val logger = LoggerFactory.getLogger(AlertService::class.java)

    fun appendAlertTypeToMetrics(hostSummary: HostSummary, hostPercentRules: MutableSet<PercentMetricRule>, hostBasicRules: MutableSet<BasicMetricRule>){
        val hostPercentMetrics = hostSummary.percentMetrics.associateBy { it.metricType }
        val hostBasicMetrics = hostSummary.basicMetrics.associateBy { it.metricType }

        appendAlertTypeToPercentMetrics(hostPercentMetrics, hostPercentRules)
        appendAlertTypeToBasicMetrics(hostBasicMetrics, hostBasicRules)
    }

    private fun appendAlertTypeToPercentMetrics(hostPercentMetrics: Map<PercentMetricType, PercentMetric>, hostPercentRules: MutableSet<PercentMetricRule>) {
        for (rule in hostPercentRules) {
            when (rule.type) {
                RuleType.CPU_USAGE -> addAlertTypePercent(hostPercentMetrics[PercentMetricType.CPU_USAGE]!!, rule)
                RuleType.MEMORY_USAGE -> addAlertTypePercent(hostPercentMetrics[PercentMetricType.MEMORY_USAGE]!!, rule)
                RuleType.DISK_USAGE -> addAlertTypePercent(hostPercentMetrics[PercentMetricType.DISK_USAGE]!!, rule)
                else -> throw IllegalStateException("Forbidden percent rule type: ${rule.type}")
            }
        }
        for ((_,v) in hostPercentMetrics) {
            v.alertType = if (v.alertType == null) AlertType.OK else v.alertType
        }
    }

    private fun appendAlertTypeToBasicMetrics(hostBasicMetrics: Map<BasicMetricType, BasicMetric>, hostBasicRules: MutableSet<BasicMetricRule>) {
        for (rule in hostBasicRules) {
            when (rule.type) {
                RuleType.NETWORK_IN -> addAlertTypeBasic(hostBasicMetrics[BasicMetricType.NETWORK_IN]!!, rule)
                RuleType.NETWORK_OUT -> addAlertTypeBasic(hostBasicMetrics[BasicMetricType.NETWORK_OUT]!!, rule)
                else -> throw IllegalStateException("Forbidden basic rule type: ${rule.type}")
            }
        }
        for ((_,v) in hostBasicMetrics) {
            v.alertType = if (v.alertType == null) AlertType.OK else v.alertType
        }
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

    private fun addAlertTypeToContainer(containerSummary: ContainerSummary) = when {
        ContainerState.RUNNING != containerSummary.status ->
            containerSummary.alertType = AlertType.CRITICAL
        else -> containerSummary.alertType = AlertType.OK
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
                PercentMetric(PercentMetricType.CPU_USAGE, 0.0, 0.0, 0.0, AlertType.OK),
                PercentMetric(PercentMetricType.DISK_USAGE, 0.0, 0.0, 0.0, AlertType.OK),
                PercentMetric(PercentMetricType.MEMORY_USAGE, 0.0, 0.0, 0.0, AlertType.OK)
            ),
            listOf(
                BasicMetric(BasicMetricType.NETWORK_IN, 0L, AlertType.OK),
                BasicMetric(BasicMetricType.NETWORK_OUT, 0L, AlertType.OK)
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

    fun checkForAlertSummary(hostSummary: HostSummary, prevHostSummary: HostSummary, host: Host){
        val hostMetrics = hostSummary.percentMetrics.associateBy { it.metricType }
        val prevHostMetrics = prevHostSummary.percentMetrics.associateBy { it.metricType }
        for (mt in PercentMetricType.values()) {
            if (hostMetrics.containsKey(mt) && prevHostMetrics.containsKey(mt)) {
                checkForAlert(hostMetrics[mt]!!, prevHostMetrics[mt]!!, hostSummary, host.hostName!!)
            }
            else {
                logger.warn("Missing metric $mt for host ${host.hostName}")
            }
        }
        checkForContainerAlerts(hostSummary, prevHostSummary.containers, host)
    }

    private fun checkForAlert(
        percentMetric: PercentMetric,
        prevPercentMetric: PercentMetric,
        hostSummary: HostSummary,
        hostName: String
    ) {
        if (percentMetric.alertType == null) return
        logger.debug("Checking basic metric: ${percentMetric.metricType}")
        if (percentMetric.alertType != prevPercentMetric.alertType) {
            val alertMessage = "Host $hostName: ${percentMetric.metricType.humanReadable()} is ${percentMetric.percent}%"
            logger.info(alertMessage)
            logger.debug("$percentMetric")
            sendAlert(Alert(hostSummary.id, percentMetric.alertType!!, alertMessage))
        }
    }

    private fun checkForContainerAlerts(
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
            if (prevContainerMap[containerSummary.id] != null) {
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
            } else if (containerSummary.alertType != AlertType.OK) {
                val alertMessage: String =
                    "Host ${host.hostName}: something wrong with container ${containerSummary.name}. " +
                            "State: ${containerSummary.status.humaneReadable()}"
                sendAlert(Alert(hostSummary.id, containerSummary.alertType!!, alertMessage))
            }
        }
    }

    private fun addAlertTypePercent(percentMetric: PercentMetric, percentRule: PercentMetricRule) = when {
        percentMetric.percent < percentRule.warnLevel.toDouble() -> percentMetric.alertType = AlertType.OK
        percentMetric.percent > percentRule.criticalLevel.toDouble() -> percentMetric.alertType = AlertType.CRITICAL
        else -> percentMetric.alertType = AlertType.WARN
    }

    private fun addAlertTypeBasic(basicMetric: BasicMetric, rule: BasicMetricRule) = when {
        basicMetric.value < rule.transferLimit -> basicMetric.alertType = AlertType.OK
        basicMetric.value > rule.transferLimit -> basicMetric.alertType = AlertType.CRITICAL
        else -> basicMetric.alertType = AlertType.WARN
    }

    private fun sendAlert(alert: Alert) {
        logger.info("Sending alert...")
        influxDbProxy.alertCounter += 1
        template.convertAndSend("/alerts", AlertWithCounter(alert, influxDbProxy.alertCounter))
        CoroutineScope(Dispatchers.IO).launch {
            influxDbProxy.saveAlert(alert)
        }
    }
}