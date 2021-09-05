package pl.edu.agh.dockerbuddy.service

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
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
    fun addHost(host: Host): Host {
        return hostRepository.save(host)
    }

    fun getHostsWithSummary(): List<HostWithSummary> {
        val hostsWithSummary = mutableListOf<HostWithSummary>()
        val hosts = hostRepository.findAll()

        if (hosts.isEmpty()) throw EntityNotFoundException("No hosts were found in database")
        hosts.forEach {
            host -> hostsWithSummary.add(
                inMemory.getHostSummary(host.id!!)?.let {
                    HostWithSummary(
                        host.id!!,
                        host.hostName!!,
                        host.ip!!,
                        it
                    )
                }!!
            )
        }

        runBlocking {
            launch {
                influxDbProxy.saveMetric(hostsWithSummary)
            }
        }

        return hostsWithSummary.toList()
    }
}