package pl.edu.agh.dockerbuddy.service

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import pl.edu.agh.dockerbuddy.inmemory.InMemory
import pl.edu.agh.dockerbuddy.model.HostWithSummary
import pl.edu.agh.dockerbuddy.model.entity.ContainerReport
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.model.enums.ReportStatus
import pl.edu.agh.dockerbuddy.model.metric.ContainerSummary
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import pl.edu.agh.dockerbuddy.repository.HostRepository
import java.util.*
import javax.persistence.EntityNotFoundException

@Service
class HostService (
    private val hostRepository: HostRepository,
    @Qualifier("InMemoryStorage") val inMemory: InMemory,
){
    private val logger = LoggerFactory.getLogger(HostService::class.java)

    fun addHost(host: Host): Host {
        logger.info("New host received. Attempting to add: $host")
        return hostRepository.save(host)
    }

    fun deleteHost(id: UUID) {
        logger.info("Deleting host $id")
        if (!hostRepository.existsById(id)) throw EntityNotFoundException("Host $id does not exist")
        inMemory.deleteHost(id)
        return hostRepository.deleteById(id)
    }

    fun updateHost(id: UUID, host: Host): Host {
        if (!hostRepository.existsById(id)) throw EntityNotFoundException("Host $id does not exist")
        logger.info("Host $id update: $host")
        host.id = id
        return hostRepository.save(host)
    }

    fun getHostWithSummary(id: UUID): HostWithSummary {
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
            host.hostRules.toList().sortedBy { it.id },
            host.containers.toList().sortedBy { it.id },
            hostSummary
        )
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
                    host.hostRules.toList().sortedBy { it.id },
                    host.containers.toList().sortedBy { it.id },
                    hostSummary
                )
            )
        }
        return hostsWithSummary.toList()
    }

    fun updateHostContainerReport(id: UUID, updatedContainerReport: ContainerReport): Host {
        val host = hostRepository.findByIdOrNull(id) ?: throw EntityNotFoundException("Host $id does not exist")
        val containerName = updatedContainerReport.containerName
        host.containers.find { it.containerName == containerName }?.reportStatus = updatedContainerReport.reportStatus
        val hostSummary: HostSummary? = inMemory.getHostSummary(id)
        if (hostSummary != null) {
            hostSummary.containers.first { it.name == containerName }.reportStatus = updatedContainerReport.reportStatus
            inMemory.saveHostSummary(id, hostSummary)
        }
        return hostRepository.save(host)
    }

    fun addContainersToHost(host: Host, containersSummaries: List<ContainerSummary>): Host {
        for (containerSummary in containersSummaries) {
            addContainerToHost(host, containerSummary)
        }
        return hostRepository.save(host)
    }

    private fun addContainerToHost(host: Host, containerSummary: ContainerSummary) {
        val containerReport = ContainerReport(containerSummary.name, ReportStatus.NEW)
        host.containers.add(containerReport)
    }
}