package pl.edu.agh.dockerbuddy.model

import pl.edu.agh.dockerbuddy.model.metric.HostSummary

data class HostWithSummary(
    val id: Long,
    val hostName: String,
    val ip: String,
    val hostSummary: HostSummary
)