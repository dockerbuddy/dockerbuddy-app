package pl.edu.agh.dockerbuddy.influxdb

data class FluxRecordContainer(
    val percentMetrics: List<FluxRecordDouble>,
    val basicMetrics: List<FluxRecordLong>
)
