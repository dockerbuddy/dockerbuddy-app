package pl.edu.agh.dockerbuddy.service

import kotlinx.coroutines.*
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import pl.edu.agh.dockerbuddy.influxdb.InfluxDbProxy
import pl.edu.agh.dockerbuddy.inmemory.InMemory
import pl.edu.agh.dockerbuddy.model.RuleType
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import pl.edu.agh.dockerbuddy.repository.HostRepository
import pl.edu.agh.dockerbuddy.tools.appendAlertTypeToMetrics
import pl.edu.agh.dockerbuddy.tools.checkForAlertSummary
import javax.persistence.EntityNotFoundException

@Service
class MetricService(
    val hostRepository: HostRepository,
    val alertService: AlertService,
    @Qualifier("InMemoryStorage")
    val inMemory: InMemory,
    val influxDbProxy: InfluxDbProxy
) {

    private val logger = LoggerFactory.getLogger(MetricService::class.java)

    fun postMetric(hostSummary: HostSummary, hostId: Long){
        logger.info("Processing new metrics for host $hostId")
        logger.debug("$hostSummary")
        val host: Host = hostRepository.findByIdOrNull(hostId) ?:
            throw EntityNotFoundException("Host with id $hostId not found. Cannot add metric")
        appendAlertTypeToMetrics(hostSummary, host.rules)

        val prevHostSummary: HostSummary? = inMemory.getHostSummary(hostId)
        if (prevHostSummary != null){
            logger.info("Host found in cache. Checking for alerts...")
            checkForAlertSummary(hostSummary, prevHostSummary)
            logger.info("Metrics updated")
            logger.debug("$hostSummary")
        } else {
            logger.info("No data for host $hostId in cache. Adding an entry...")
        }

        inMemory.saveHostSummary(hostId, hostSummary)
        alertService.sendMessage(hostSummary)

        CoroutineScope(Dispatchers.IO).launch {
            influxDbProxy.saveMetric(hostId, hostSummary)
        }

        CoroutineScope(Dispatchers.IO).launch {
            //I know how it looks but this is the way to handle Boolean?
            if (hostSummary.cpuUsage.alert == true)
                influxDbProxy.saveAlert(hostId, hostSummary.cpuUsage, RuleType.CpuUsage)

            if (hostSummary.diskUsage.alert == true)
                influxDbProxy.saveAlert(hostId, hostSummary.diskUsage, RuleType.DiskUsage)

            if (hostSummary.memoryUsage.alert == true)
                influxDbProxy.saveAlert(hostId, hostSummary.memoryUsage, RuleType.MemoryUsage)

            //TODO handle containers we'll probably need additional argument in saveAlert function
        }
    }
}
