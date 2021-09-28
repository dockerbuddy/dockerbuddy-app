package pl.edu.agh.dockerbuddy.model.metric

import lombok.ToString
import pl.edu.agh.dockerbuddy.model.AlertType

@ToString
data class BasicMetric(
        val used: Double,
        val total: Double,
        val percent: Double,
        var alertType: AlertType?,
        var alert: Boolean?
)