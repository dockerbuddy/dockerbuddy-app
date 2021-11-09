package pl.edu.agh.dockerbuddy.inmemory

import org.springframework.stereotype.Repository
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import java.util.*
import kotlin.collections.HashMap

@Repository("InMemoryStorage")
class InMemoryStorage : InMemory {
    private val storage: MutableMap<UUID, HostSummary> = HashMap()

    override fun getAllHostSummaries(): List<HostSummary> = storage.values.toList()

    override fun getHostSummary(hostId: UUID): HostSummary? = storage[hostId]

    override fun saveHostSummary(hostId: UUID, hostSummary: HostSummary) {
        storage[hostId] = hostSummary
    }

    override fun deleteHost(hostId: UUID) {
        storage.remove(hostId)
    }
}