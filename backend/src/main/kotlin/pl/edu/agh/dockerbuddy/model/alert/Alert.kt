package pl.edu.agh.dockerbuddy.model.alert

import java.util.*

data class Alert (
    val hostId: UUID,
    val alertType: AlertType,
    val alertMessage: String,
    var read: Boolean = false
)