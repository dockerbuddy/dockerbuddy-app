package pl.edu.agh.dockerbuddy.model.metric

import pl.edu.agh.dockerbuddy.model.AlertType

class AlertMetric(
        val alertType: AlertType,
        value: Double,
        total: Double,
        percent: Double
) : BasicMetric(value, total, percent)
