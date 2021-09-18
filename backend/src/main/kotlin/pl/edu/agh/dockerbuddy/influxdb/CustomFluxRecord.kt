package pl.edu.agh.dockerbuddy.influxdb

data class CustomFluxRecord (
    val measurement: String,
    val hostId: Long,
    val metricID: Long,
    val time: String,
    val field: String,
    val value: Double
)