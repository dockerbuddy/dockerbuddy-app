package pl.edu.agh.dockerbuddy.influxdb

import pl.edu.agh.dockerbuddy.model.AlertType
import pl.edu.agh.dockerbuddy.model.RuleType

data class AlertRecord (
        val hostId: Long,
        val alertType: AlertType,
        val alertMessage: String,
        val time: String
)