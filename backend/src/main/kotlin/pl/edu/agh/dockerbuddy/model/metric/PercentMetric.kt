package pl.edu.agh.dockerbuddy.model.metric

import lombok.ToString
import pl.edu.agh.dockerbuddy.model.alert.AlertType
import pl.edu.agh.dockerbuddy.model.enums.PercentMetricType

@ToString
data class PercentMetric (
    val metricType: PercentMetricType,
    val value: Double,
    val total: Double,
    val percent: Double,
    var alertType: AlertType?
)