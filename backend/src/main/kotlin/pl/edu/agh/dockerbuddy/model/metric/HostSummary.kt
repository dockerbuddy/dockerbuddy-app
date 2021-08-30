package pl.edu.agh.dockerbuddy.model.metric

data class HostSummary(
        val timestamp: String,
        val memoryUsage: BasicMetric,
        val diskUsage: BasicMetric,
        val cpuUsage: BasicMetric,
        val containers: List<ContainerSummary>
)
