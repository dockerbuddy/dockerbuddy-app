package pl.edu.agh.dockerbuddy.model.enums

enum class BasicMetricType {
    NETWORK_IN,
    NETWORK_OUT;

    fun humanReadable(): String {
        return name.lowercase().replace('_', ' ')
    }
}