package pl.edu.agh.dockerbuddy.service

import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import pl.edu.agh.dockerbuddy.inmemory.InMemory
import pl.edu.agh.dockerbuddy.model.alert.Alert
import pl.edu.agh.dockerbuddy.model.alert.AlertType
import pl.edu.agh.dockerbuddy.repository.HostRepository
import java.time.Instant

@Component
class AliveHostsGuard (
    val inMemory: InMemory,
    val alertService: AlertService,
    val hostRepository: HostRepository
) {
    private val timeoutMultiplier = 2.5
    private val initialConnectionTimeout = 300L // 300 seconds
    private val logger = LoggerFactory.getLogger(AliveHostsGuard::class.java)

    @Scheduled(fixedRate = 60000) // 60s
    fun hostCheck() {
        logger.info("Checking for offline hosts")
        val hostSummaries = inMemory.getAllHostSummaries().associateBy { it.id }
        val hosts = hostRepository.findAll().associateBy { it.id }

        for ((hostId, host) in hosts) {
            if (host.isTimedOut) continue

            val hostSummary = hostSummaries[hostId]
            if (hostSummary != null) {
                if (isHostTimedOut(hostSummary.timestamp, hostSummary.senderInterval)) {
                    logger.info("Host ${host.hostName} is offline. Sending alert...")
                    host.isTimedOut = true
                    val alert = Alert(
                        hostSummary.id,
                        AlertType.CRITICAL,
                        "Host: ${hosts[hostSummary.id]?.hostName} hasn't sent anything since ${hostSummary.timestamp}"
                    )
                    alertService.sendAlert(alert)
                    hostRepository.save(host)
                }
            } else if (isHostTimedOut(host.creationDate.toString(), initialConnectionTimeout)){
                logger.info("Host ${host.hostName} hasn't send any metrics since it was added. Sending alert...")
                host.isTimedOut = true
                val alert = Alert(
                    host.id!!,
                    AlertType.CRITICAL,
                    "Host: ${host.hostName} hasn't sent anything since it was added (${host.creationDate})"
                )
                alertService.sendAlert(alert)
                hostRepository.save(host)
            }
        }
    }

    private fun isHostTimedOut(lastTimestamp: String, senderInterval: Long): Boolean {
        val lastUpdate = Instant.parse(lastTimestamp).epochSecond
        val currentTime = Instant.now().epochSecond
        return currentTime - lastUpdate >= timeoutMultiplier*senderInterval
    }
}