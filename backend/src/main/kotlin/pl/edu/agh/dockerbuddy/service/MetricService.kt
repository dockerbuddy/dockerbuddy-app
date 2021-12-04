package pl.edu.agh.dockerbuddy.service

import kotlinx.coroutines.*
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.data.repository.findByIdOrNull
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service
import pl.edu.agh.dockerbuddy.influxdb.InfluxDbProxy
import pl.edu.agh.dockerbuddy.inmemory.InMemory
import pl.edu.agh.dockerbuddy.model.alert.Alert
import pl.edu.agh.dockerbuddy.model.alert.AlertType
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import pl.edu.agh.dockerbuddy.repository.HostRepository
import java.util.*
import javax.persistence.EntityNotFoundException

@Service
class MetricService(
    val hostRepository: HostRepository,
    val alertService: AlertService,
    @Qualifier("InMemoryStorage") val inMemory: InMemory,
    val influxDbProxy: InfluxDbProxy,
    val template: SimpMessagingTemplate
) {

    private val logger = LoggerFactory.getLogger(MetricService::class.java)

    /**
     * Process new host summary and send it to frontend client.
     *
     * @param hostSummary host summary received form an agent
     * @param hostId id of a host that summary describes
     */
    fun postNewMetrics(hostSummary: HostSummary, hostId: UUID){
        logger.info("Processing new metrics for host $hostId")
        logger.debug("$hostSummary")
        val host: Host = hostRepository.findByIdOrNull(hostId) ?:
            throw EntityNotFoundException("Host $hostId not found. Cannot add metric")

        // alert types must be set BEFORE checking for alerts
        val prevHostSummary: HostSummary? = inMemory.getHostSummary(hostId)
        alertService.setMetricsAlertType(hostSummary, host.hostPercentRules, host.hostBasicRules)
        alertService.setContainersAlertType(hostSummary, prevHostSummary, host)

        // compare host summary with previous one (if exists)
        if (prevHostSummary != null){
            logger.info("Host found in cache. Checking for alerts...")
            alertService.checkForAlertSummary(hostSummary, prevHostSummary, host)
            logger.info("Metrics updated")
            logger.debug("$hostSummary")
        } else {
            logger.info("No data for host $hostId in cache. Checking for alerts...")
            alertService.initialCheckForAlertSummary(hostSummary, host) // compare with mock summary
        }

        inMemory.saveHostSummary(hostId, hostSummary) // save host summary in cache (override previous one)
        sendHostSummary(hostSummary)

        // update host timout status - metrics arrived so host is back online
        if (host.isTimedOut) {
            val alert = Alert(
                host.id!!,
                AlertType.OK,
                "Host: ${host.hostName} is back online"
            )
            alertService.sendAlert(alert)
        }
        host.isTimedOut = false
        hostRepository.save(host)

        // save metrics in an external database
        CoroutineScope(Dispatchers.IO).launch {
            influxDbProxy.saveMetric(hostId, hostSummary)
        }
    }

    private fun sendHostSummary(hostSummary: HostSummary) {
        logger.info("Sending host summary...")
        template.convertAndSend("/metrics", hostSummary)
    }
}
