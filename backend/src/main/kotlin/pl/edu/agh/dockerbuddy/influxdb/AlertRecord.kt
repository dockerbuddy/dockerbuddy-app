package pl.edu.agh.dockerbuddy.influxdb

import pl.edu.agh.dockerbuddy.model.alert.AlertType
import java.util.*

data class AlertRecord (
    val hostId: UUID,
    val alertType: AlertType,
    val alertMessage: String,
    val time: String,
    val read: Boolean
)