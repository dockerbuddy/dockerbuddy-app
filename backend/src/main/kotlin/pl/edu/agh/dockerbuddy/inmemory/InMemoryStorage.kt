package pl.edu.agh.dockerbuddy.inmemory

import pl.edu.agh.dockerbuddy.model.metric.HostSummary

class InMemoryStorage : InMemory {


    override fun getAllHostSummaries(): List<HostSummary> {
        TODO("Not yet implemented")
    }

    override fun getHostSummary(hostId: Long): HostSummary {
        TODO("Not yet implemented")
    }

    override fun saveHostSummary(hostId: Long, hostSummary: HostSummary) {
        TODO("Not yet implemented")
    }
}