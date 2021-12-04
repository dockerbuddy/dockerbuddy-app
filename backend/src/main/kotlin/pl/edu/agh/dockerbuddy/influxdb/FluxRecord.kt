package pl.edu.agh.dockerbuddy.influxdb

data class FluxRecord (
    val time: String,
    val value: Double
)