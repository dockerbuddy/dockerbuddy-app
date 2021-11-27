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

    fun postMetric(hostSummary: HostSummary, hostId: UUID){
        logger.info("Processing new metrics for host $hostId")
        logger.debug("$hostSummary")
        val host: Host = hostRepository.findByIdOrNull(hostId) ?:
            throw EntityNotFoundException("Host $hostId not found. Cannot add metric")
        alertService.appendAlertTypeToMetrics(hostSummary, host.hostPercentRules, host.hostBasicRules)

        val prevHostSummary: HostSummary? = inMemory.getHostSummary(hostId)
        alertService.appendAlertTypeToContainers(hostSummary, prevHostSummary, host)

        if (prevHostSummary != null){

            logger.info("Host found in cache. Checking for alerts...")
            alertService.checkForAlertSummary(hostSummary, prevHostSummary, host)
            logger.info("Metrics updated")
            logger.debug("$hostSummary")
        } else {
            logger.info("No data for host $hostId in cache. Checking for alerts...")
            alertService.initialCheckForAlertSummary(hostSummary, host)
        }

        inMemory.saveHostSummary(hostId, hostSummary)
        sendHostSummary(hostSummary)

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

        CoroutineScope(Dispatchers.IO).launch {
            influxDbProxy.saveMetric(hostId, hostSummary)
        }
    }

    fun sendHostSummary(hostSummary: HostSummary) {
        logger.info("Sending host summary...")
        template.convertAndSend("/metrics", hostSummary)
    }
}
