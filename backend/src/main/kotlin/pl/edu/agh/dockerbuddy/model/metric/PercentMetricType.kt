package pl.edu.agh.dockerbuddy.model.metric

enum class PercentMetricType {
    MEMORY_USAGE,
    DISK_USAGE,
    CPU_USAGE;

    fun humanReadable(): String {
        return name.lowercase().replace('_', ' ')
    }
}