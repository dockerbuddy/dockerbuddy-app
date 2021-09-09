package pl.edu.agh.dockerbuddy.service

import io.reactivex.internal.util.ExceptionHelper
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import pl.edu.agh.dockerbuddy.influxdb.InfluxDbProxy
import pl.edu.agh.dockerbuddy.inmemory.InMemory
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

    private val logger = LoggerFactory.getLogger(ExceptionHelper::class.java)

    fun postMetric(hostSummary: HostSummary, hostId: Long){
        val host: Host = hostRepository.findByIdOrNull(hostId) ?: throw EntityNotFoundException()
        appendAlertTypeToMetrics(hostSummary, host.rules)

        val prevHostSummary: HostSummary? = inMemory.getHostSummary(hostId)
        if (prevHostSummary != null){
            checkForAlertSummary(hostSummary, prevHostSummary)
        }

        inMemory.saveHostSummary(hostId, hostSummary)
        alertService.sendMessage(hostSummary)

        runBlocking {
            launch {
                influxDbProxy.saveMetric(hostId, hostSummary)
            }
        }
    }
}
