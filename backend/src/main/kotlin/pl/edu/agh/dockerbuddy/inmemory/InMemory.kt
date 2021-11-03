package pl.edu.agh.dockerbuddy.inmemory

import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import java.util.*

interface InMemory {
    fun getAllHostSummaries(): List<HostSummary>
    fun getHostSummary(hostId: UUID): HostSummary?
    // save stands both for COMMIT and UPDATE
    fun saveHostSummary(hostId: UUID, hostSummary: HostSummary)
    fun deleteHost(hostId: UUID)
}