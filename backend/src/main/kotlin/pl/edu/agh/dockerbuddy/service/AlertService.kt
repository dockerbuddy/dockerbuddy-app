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
class AlertService (
    val template: SimpMessagingTemplate,
    val influxDbProxy: InfluxDbProxy,
    val hostService: HostService
) {
    private val logger = LoggerFactory.getLogger(AlertService::class.java)

    /**
     * Set alert types on host metrics.
     *
     * @param hostSummary host summary that was received from an agent
     * @param hostPercentRules host's rules for percent metrics
     * @param hostBasicRules host's rules for basic metrics
     */
    fun setMetricsAlertType (
        hostSummary: HostSummary,
        hostPercentRules: MutableSet<PercentMetricRule>,
        hostBasicRules: MutableSet<BasicMetricRule>
    ) {
        val hostPercentMetrics = hostSummary.percentMetrics.associateBy { it.metricType }
        val hostBasicMetrics = hostSummary.basicMetrics.associateBy { it.metricType }

        setPercentMetricsAlertType(hostPercentMetrics, hostPercentRules)
        setBasicMetricsAlertType(hostBasicMetrics, hostBasicRules)
    }

    private fun setPercentMetricsAlertType (
        hostPercentMetrics: Map<PercentMetricType, PercentMetric>,
        hostPercentRules: MutableSet<PercentMetricRule>
    ) {
        // based on existing rules check for alerts
        for (rule in hostPercentRules) {
            when (rule.type) {
                RuleType.CPU_USAGE -> hostPercentMetrics[PercentMetricType.CPU_USAGE]?.let {
                    setAlertTypePercent(it, rule)
                }
                RuleType.MEMORY_USAGE -> hostPercentMetrics[PercentMetricType.MEMORY_USAGE]?.let {
                    setAlertTypePercent(it, rule)
                }
                RuleType.DISK_USAGE -> hostPercentMetrics[PercentMetricType.DISK_USAGE]?.let {
                    setAlertTypePercent(it, rule)
                }
                else -> throw IllegalStateException("Forbidden percent rule type: ${rule.type}")
            }
        }
        // for metrics that weren't processed (don't have rules defined) set default alertType value (OK)
        for ((_,v) in hostPercentMetrics) {
            v.alertType = if (v.alertType == null) AlertType.OK else v.alertType
        }
    }

    private fun setBasicMetricsAlertType (
        hostBasicMetrics: Map<BasicMetricType, BasicMetric>, hostBasicRules:
        MutableSet<BasicMetricRule>
    ) {
        // based on existing rules check for alerts
        for (rule in hostBasicRules) {
            when (rule.type) {
                RuleType.NETWORK_IN -> hostBasicMetrics[BasicMetricType.NETWORK_IN]?.let {
                    setAlertTypeBasic(it, rule)
                }
                RuleType.NETWORK_OUT -> hostBasicMetrics[BasicMetricType.NETWORK_OUT]?.let {
                    setAlertTypeBasic(it, rule)
                }
                else -> throw IllegalStateException("Forbidden basic rule type: ${rule.type}")
            }
        }
        // for metrics that weren't processed (don't have rules defined) set default alertType value (OK)
        for ((_,v) in hostBasicMetrics) {
            v.alertType = if (v.alertType == null) AlertType.OK else v.alertType
        }
    }

    /**
     * Set alert types on containers.
     *
     * @param hostSummary host summary that was received from an agent
     * @param prevHostSummary previous host summary for host (with alert types set)
     * @param host host data
     */
    fun setContainersAlertType (
        hostSummary: HostSummary,
        prevHostSummary: HostSummary?,
        host: Host
    ) {
        val reports = host.containers.toList() // containers' metadata persisted with their host
        val containers = hostSummary.containers
        val containerMap = containers.associateBy { it.name }
        val prevContainerNames = prevHostSummary?.containers?.map { it.name } ?: hostSummary.containers.map { it.name }

        // process containers based on their metadata stored with host in form of 'reports' (like metric rules)
        for (report in reports) {
            if (report.reportStatus == ReportStatus.WATCHED) { // process only containers that user marked as important
                if (report.containerName !in containerMap.keys) { // check if container is missing from the newest host summary
                    if (report.containerName in prevContainerNames) { // if missing container is in cache then it has just disappeared
                        sendAlert(
                            Alert(
                                hostSummary.id,
                                AlertType.CRITICAL,
                                "Host ${host.hostName}: missing container ${report.containerName}"
                            )
                        )
                        continue
                    }
                } else if (report.containerName !in prevContainerNames) { // container is present but wasn't before
                    sendAlert(
                        Alert(
                            hostSummary.id,
                            AlertType.OK,
                            "Host ${host.hostName}: container ${report.containerName} is back. " +
                                    "State: ${containerMap[report.containerName]?.state?.humaneReadable()}"
                        )
                    )
                }
                // check if container is running
                containerMap[report.containerName]?.let {
                    setContainerAlertType(it)
                }
            }
        }
        // set alert types for the rest of containers
        containers.forEach {
            it.alertType = if (it.alertType == null) AlertType.OK else it.alertType
        }
    }

    // check if container is running and set alert type accordingly
    private fun setContainerAlertType (containerSummary: ContainerSummary) = when {
        ContainerState.RUNNING != containerSummary.state ->
            containerSummary.alertType = AlertType.CRITICAL
        else -> containerSummary.alertType = AlertType.OK
    }

    /**
     * Check for alerts when there is no previous host summary.
     *
     * @param hostSummary host summary that was received from an agent
     * @param host host data
     */
    fun initialCheckForAlertSummary (hostSummary: HostSummary, host: Host) {
        logger.debug("Initial check for alerts")
        val reportsMap = host.containers.associateBy { it.containerName }
        val containerSummaryList = hostSummary.containers
        val newContainers = mutableListOf<ContainerSummary>()
        val mockPrevHostSummary = HostSummary( // mock host summary. Normally there would be one form cache
            UUID.randomUUID(),
            "123",
            60,
            // it is important to set alert types to OK so that we can discover eventual change of state (it triggers alert)
            listOf(
                PercentMetric(PercentMetricType.CPU_USAGE, 0.0, 0.0, 0.0, AlertType.OK),
                PercentMetric(PercentMetricType.DISK_USAGE, 0.0, 0.0, 0.0, AlertType.OK),
                PercentMetric(PercentMetricType.MEMORY_USAGE, 0.0, 0.0, 0.0, AlertType.OK)
            ),
            listOf(
                BasicMetric(BasicMetricType.NETWORK_IN, 0L, AlertType.OK),
                BasicMetric(BasicMetricType.NETWORK_OUT, 0L, AlertType.OK)
            ),
            hostSummary.containers.toMutableList().map { it.copy() }

        )
        mockPrevHostSummary.containers.forEach { it.alertType = AlertType.OK }
        mockPrevHostSummary.containers.forEach { it.state = ContainerState.RUNNING } // FIXME ugly fix

        for (containerSummary in containerSummaryList) {
            if (containerSummary.name !in reportsMap.keys) { // if container is not present in host data then add it there
                containerSummary.reportStatus = ReportStatus.NEW
                newContainers.add(containerSummary)
            }
        }
        checkForAlertSummary(
            hostSummary,
            mockPrevHostSummary,
            if (newContainers.isEmpty()) host else hostService.addContainersToHost(host, newContainers)
        )
    }

    /**
     * Check host summary for alerts, set accordingly and send if any appeared.
     *
     * @param hostSummary host summary that was received from an agent
     * @param prevHostSummary previous host summary for host (with alert types set)
     * @param host host data
     */
    fun checkForAlertSummary (hostSummary: HostSummary, prevHostSummary: HostSummary, host: Host) {
        val hostPercentMetrics = hostSummary.percentMetrics.associateBy { it.metricType }
        val prevHostPercentMetrics = prevHostSummary.percentMetrics.associateBy { it.metricType }
        val hostBasicMetrics = hostSummary.basicMetrics.associateBy { it.metricType }
        val prevHostBasicMetrics = prevHostSummary.basicMetrics.associateBy { it.metricType }

        // check each percent metric for alert and send if there is one
        for (mt in PercentMetricType.values()) {
            if (hostPercentMetrics.containsKey(mt) && prevHostPercentMetrics.containsKey(mt)) {
                hostPercentMetrics[mt]?.let { percentMetric ->
                    prevHostPercentMetrics[mt]?.let { prevPercentMetric ->
                        host.hostName?.let { hostName ->
                            checkForPercentMetricAlert(percentMetric, prevPercentMetric, hostSummary, hostName)
                        }
                    }
                }
            } else {
                logger.warn("Missing metric $mt for host ${host.hostName}")
            }
        }

        // check each basic metric for alert and send if there is one
        for (mt in BasicMetricType.values()) {
            if (hostBasicMetrics.containsKey(mt) && prevHostBasicMetrics.containsKey(mt)) {
                hostBasicMetrics[mt]?.let { basicMetric ->
                    prevHostBasicMetrics[mt]?.let { prevBasicMetric ->
                        host.hostName?.let { hostName ->
                            checkForBasicMetricAlert(basicMetric, prevBasicMetric, hostSummary, hostName)
                        }
                    }
                }
            } else {
                logger.warn("Missing metric $mt for host ${host.hostName}")
            }
        }
        checkForContainerAlerts(hostSummary, prevHostSummary.containers, host)
    }

    private fun checkForPercentMetricAlert (
        percentMetric: PercentMetric,
        prevPercentMetric: PercentMetric,
        hostSummary: HostSummary,
        hostName: String
    ) {
        if (percentMetric.alertType == null) return
        logger.debug("Checking percent metric: ${percentMetric.metricType}")
        if (percentMetric.alertType != prevPercentMetric.alertType) { // trigger alert if alert type has changed
            val alertMessage = "Host $hostName: ${percentMetric.metricType.humanReadable()} is ${percentMetric.percent}%"
            logger.info(alertMessage)
            logger.debug("$percentMetric")
            sendAlert(Alert(hostSummary.id, percentMetric.alertType!!, alertMessage))
        }
    }

    private fun checkForBasicMetricAlert (
        basicMetric: BasicMetric,
        prevBasicMetric: BasicMetric,
        hostSummary: HostSummary,
        hostName: String
    ) {
        if (basicMetric.alertType == null) return
        logger.debug("Checking basic metric: ${basicMetric.metricType}")
        if (basicMetric.alertType != prevBasicMetric.alertType) { // trigger alert if alert type has changed
            val alertMessage = "Host $hostName: ${basicMetric.metricType.humanReadable()} is ${basicMetric.alertType}"
            logger.info(alertMessage)
            logger.debug("$basicMetric")
            sendAlert(Alert(hostSummary.id, basicMetric.alertType!!, alertMessage))
        }
    }

    private fun checkForContainerAlerts (
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
            // if container is not in host reports then send alert and add it to host
            if (!containerReportMap.containsKey(containerSummary.name)) {
                sendAlert(
                    Alert(
                        hostSummary.id,
                        AlertType.OK,
                        "Host ${host.hostName}: new container: ${containerSummary.name}"
                    )
                )
                containerSummary.reportStatus = ReportStatus.NEW
                newContainerList.add(containerSummary)
            } else {
                containerSummary.reportStatus = containerReportMap[containerSummary.name]?.reportStatus
            }

            if (prevContainerMap[containerSummary.id] != null) {
                if (containerReportMap[containerSummary.name]?.reportStatus == ReportStatus.WATCHED &&
                    containerSummary.alertType != prevContainerMap[containerSummary.id]?.alertType
                ) {
                    val alertMessage =
                        "Host ${host.hostName}: something wrong with container ${containerSummary.name}. " +
                        "State: ${containerSummary.state.humaneReadable()}"
                    containerSummary.alertType?.let { alertType ->
                        Alert(hostSummary.id, alertType, alertMessage)
                    }?.let { alert -> sendAlert(alert) }
                }
            } else if (containerSummary.alertType != AlertType.OK) {
                val alertMessage: String =
                    "Host ${host.hostName}: something wrong with container ${containerSummary.name}. " +
                            "State: ${containerSummary.state.humaneReadable()}"
                containerSummary.alertType?.let { alertType ->
                    Alert(hostSummary.id, alertType, alertMessage)
                }?.let { alert -> sendAlert(alert) }
            }
        }
        if (newContainerList.isNotEmpty()) {
            hostService.addContainersToHost(host, newContainerList)
        }
    }

    private fun setAlertTypePercent (percentMetric: PercentMetric, percentRule: PercentMetricRule) = when {
        percentMetric.percent < percentRule.warnLevel.toDouble() -> percentMetric.alertType = AlertType.OK
        percentMetric.percent > percentRule.criticalLevel.toDouble() -> percentMetric.alertType = AlertType.CRITICAL
        else -> percentMetric.alertType = AlertType.WARN
    }

    private fun setAlertTypeBasic (basicMetric: BasicMetric, rule: BasicMetricRule) = when {
        basicMetric.value < rule.warnLevel -> basicMetric.alertType = AlertType.OK
        basicMetric.value > rule.criticalLevel -> basicMetric.alertType = AlertType.CRITICAL
        else -> basicMetric.alertType = AlertType.WARN
    }

    /**
     * Send alert to frontend client.
     *
     * @param alert
     */
    fun sendAlert (alert: Alert) {
        logger.info("Sending alert...")
        influxDbProxy.alertCounter += 1
        template.convertAndSend("/alerts", AlertWithCounter(alert, influxDbProxy.alertCounter))
        CoroutineScope(Dispatchers.IO).launch {
            influxDbProxy.saveAlert(alert)
        }
    }
}