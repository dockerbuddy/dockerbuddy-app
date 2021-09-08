package pl.edu.agh.dockerbuddy.service

import io.reactivex.internal.util.ExceptionHelper
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import pl.edu.agh.dockerbuddy.inmemory.InMemory
import pl.edu.agh.dockerbuddy.model.HostWithSummary
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.repository.HostRepository
import javax.persistence.EntityNotFoundException
import pl.edu.agh.dockerbuddy.influxdb.InfluxDbProxy

@Service
class HostService (
    private val hostRepository: HostRepository,
    private val inMemory: InMemory,
    private val influxDbProxy: InfluxDbProxy
){
    private val logger = LoggerFactory.getLogger(ExceptionHelper::class.java)

    fun addHost(host: Host): Host {
        return hostRepository.save(host)
    }

    fun getHostsWithSummary(): List<HostWithSummary> {
        logger.info("Fetching all hosts with summary")
        val hostsWithSummary = mutableListOf<HostWithSummary>()
        val hosts = hostRepository.findAll()
        logger.info("Hosts: $hosts")
        if (hosts.isEmpty()) throw EntityNotFoundException("No hosts were found in database")

        hosts.forEach { logger.info(it.toString()) }

        // TODO handle case when there is no summary for host -> sole endpoint for hosts?
//        hosts.forEach {
//            host -> hostsWithSummary.add(
//                inMemory.getHostSummary(host.id!!)?.let {
//                    HostWithSummary(
//                        host.id!!,
//                        host.hostName!!,
//                        host.ip!!,
//                        it
//                    )
//                }!!
//            )
//        }

        for (host in hosts) {
            val hostWithSummary = inMemory.getHostSummary(host.id!!)
            if (hostWithSummary != null) {
                hostsWithSummary.add(
                    HostWithSummary(
                        host.id!!,
                        host.hostName!!,
                        host.ip!!,
                        hostWithSummary
                    )
                )

            }
        }

        runBlocking {
            launch {
                influxDbProxy.saveMetrics(hostsWithSummary)
            }
        }

        if (hostsWithSummary.isEmpty()) throw EntityNotFoundException("None of the hosts does contain any mecovtrics")

        return hostsWithSummary.toList()
    }
}