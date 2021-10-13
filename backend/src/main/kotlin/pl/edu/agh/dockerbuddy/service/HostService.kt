package pl.edu.agh.dockerbuddy.service

import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import pl.edu.agh.dockerbuddy.inmemory.InMemory
import pl.edu.agh.dockerbuddy.model.HostWithSummary
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.repository.HostRepository
import javax.persistence.EntityNotFoundException

@Service
class HostService (
    private val hostRepository: HostRepository,
    private val inMemory: InMemory,
){
    private val logger = LoggerFactory.getLogger(HostService::class.java)

    fun addHost(host: Host): Host {
        logger.info("New host received. Attempting to add: $host")
        return hostRepository.save(host)
    }

    fun deleteHost(id: Long) {
        logger.info("Deleting host $id")
        if (!hostRepository.existsById(id)) throw EntityNotFoundException("Host $id does not exist")
        inMemory.deleteHost(id)
        return hostRepository.deleteById(id)
    }

    fun updateHost(id: Long, host: Host): Host {
        if (!hostRepository.existsById(id)) throw EntityNotFoundException("Host $id does not exist")
        logger.info("Host $id update: $host")
        host.id = id
        return hostRepository.save(host)
    }

    fun getHostWithSummary(id: Long): HostWithSummary {
        logger.info("Fetching host $id")
        val foundHost = hostRepository.findById(id)
        if (foundHost.isEmpty) throw EntityNotFoundException("Host $id does not exist")
        val host = foundHost.get()

        logger.info("Fetching host $id summary")
        val hostSummary =  inMemory.getHostSummary(id)
        return HostWithSummary(
            host.id!!,
            host.hostName!!,
            host.ip!!,
            host.hostRules.toList(),
            host.containersRules.toList(),
            hostSummary
        )
    }

    fun getHostWithSettings(id: Long): Host {
        logger.info("Fetching host $id")
        val foundHost = hostRepository.findById(id)
        if (foundHost.isEmpty) throw EntityNotFoundException("Host $id does not exist")
        return foundHost.get()
    }

    fun getAllHostsWithSummaries(): List<HostWithSummary> {
        logger.info("Fetching all hosts with summary")
        val hostsWithSummary = mutableListOf<HostWithSummary>()
        val hosts = hostRepository.findAll()
        if (hosts.isEmpty()) return emptyList()

        logger.info("Processing ${hosts.size} found hosts")
        for (host in hosts) {
            logger.debug("> $host")
            val hostSummary = inMemory.getHostSummary(host.id!!)
            logger.debug("Found newest host summary: $hostSummary")
            hostsWithSummary.add(
                HostWithSummary(
                    host.id!!,
                    host.hostName!!,
                    host.ip!!,
                    host.hostRules.toList(),
                    host.containersRules.toList(),
                    hostSummary
                )
            )
        }

        return hostsWithSummary.toList()
    }
}