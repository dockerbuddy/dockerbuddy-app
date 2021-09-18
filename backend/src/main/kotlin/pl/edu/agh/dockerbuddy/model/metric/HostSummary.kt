package pl.edu.agh.dockerbuddy.model.metric

import lombok.ToString

@ToString
data class HostSummary(
    val id: Long,
    val timestamp: String,
    val memoryUsage: BasicMetric,
    val diskUsage: BasicMetric,
    val cpuUsage: BasicMetric,
    val containers: List<ContainerSummary>
)
