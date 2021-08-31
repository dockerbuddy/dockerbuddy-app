package pl.edu.agh.dockerbuddy.inmemory

import pl.edu.agh.dockerbuddy.model.metric.HostSummary

interface InMemory {
    fun getAllHostSummaries(): List<HostSummary>
    fun getHostSummary(hostId: Long): HostSummary
    // save stands both for COMMIT and UPDATE
    fun saveHostSummary(hostId: Long, hostSummary: HostSummary)
}