package pl.edu.agh.dockerbuddy.service

import io.reactivex.internal.util.ExceptionHelper
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
    private val logger = LoggerFactory.getLogger(ExceptionHelper::class.java)

    fun addHost(host: Host): Host {
        logger.info("New host received. Attempting to add: $host")
        return hostRepository.save(host)
    }

    fun getHostsWithSummary(): List<HostWithSummary> {
        logger.info("Fetching all hosts with summary")
        val hostsWithSummary = mutableListOf<HostWithSummary>()
        val hosts = hostRepository.findAll()
        if (hosts.isEmpty()) throw EntityNotFoundException("No hosts were found in database")

        logger.info("Processing found hosts:")
        for (host in hosts) {
            logger.info("> $host")
            val hostSummary = inMemory.getHostSummary(host.id!!)
            logger.info("Found newest host summary: $hostSummary") // TODO change message
            hostsWithSummary.add(
                HostWithSummary(
                    host.id!!,
                    host.hostName!!,
                    host.ip!!,
                    hostSummary
                )
            )
        }

        if (hostsWithSummary.isEmpty()) throw EntityNotFoundException("None of hosts does contain any metrics")

        return hostsWithSummary.toList()
    }
}