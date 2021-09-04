package pl.edu.agh.dockerbuddy.model.metric

import pl.edu.agh.dockerbuddy.model.AlertType

data class BasicMetric(
        val value: Double,
        val total: Double,
        val percent: Double,
        val alertType: AlertType?,
        val alert: Boolean?

)