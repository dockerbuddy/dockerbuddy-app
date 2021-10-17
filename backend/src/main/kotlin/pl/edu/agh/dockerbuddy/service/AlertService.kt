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
import pl.edu.agh.dockerbuddy.model.RuleType
import pl.edu.agh.dockerbuddy.model.entity.MetricRule
import pl.edu.agh.dockerbuddy.model.metric.BasicMetric
import pl.edu.agh.dockerbuddy.model.metric.ContainerSummary
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import pl.edu.agh.dockerbuddy.tools.addAlertType

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
        if (basicMetric.state != prevBasicMetric.state) {
            val alertMessage = "Host ${hostSummary.id}: $metricName is ${basicMetric.percent}%"
            sendAlert(Alert(hostSummary.id, basicMetric.state!!, alertMessage))
        }
    }

    fun checkForAlerts(containersSummaries: List<ContainerSummary>, prevContainersSummaries: List<ContainerSummary>, hostSummary: HostSummary) {
        val containers = containersSummaries.associateBy { it.id }
        val prevContainers = prevContainersSummaries.associateBy { it.id }
        for (cont in containers) {
            if (cont.key !in prevContainers.keys) continue // TODO case when there's new container -> AlertType.NewCont ?
            val container = cont.value
            if (container.alertType != prevContainers[container.id]!!.alertType){
                val alertMessage = "Host ${hostSummary.id}: something wrong with container ${container.id}"
                sendAlert(Alert(hostSummary.id, container.alertType!!, alertMessage))
            }
        }
    }

}