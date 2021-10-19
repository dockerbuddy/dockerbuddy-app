package pl.edu.agh.dockerbuddy.model.metric

import lombok.ToString
import pl.edu.agh.dockerbuddy.model.AlertType

@ToString
data class BasicMetric(
    val metricType: MetricType,
    val value: Double,
    val total: Double,
    val percent: Double,
    var alertType: AlertType?,
)