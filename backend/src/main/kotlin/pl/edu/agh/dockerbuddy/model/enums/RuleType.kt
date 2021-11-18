package pl.edu.agh.dockerbuddy.model.enums

enum class RuleType {
    MEMORY_USAGE,
    DISK_USAGE,
    CPU_USAGE;

    fun humanReadable(): String {
        return name.lowercase().replace('_', ' ')
    }
}