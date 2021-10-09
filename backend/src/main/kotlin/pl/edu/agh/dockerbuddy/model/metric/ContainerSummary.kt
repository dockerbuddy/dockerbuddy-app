package pl.edu.agh.dockerbuddy.model.metric

import lombok.ToString
import pl.edu.agh.dockerbuddy.model.AlertType

@ToString
data class ContainerSummary(
    val id: String,
    val name: String,
    val image: String,
    //TODO replace to enum after @Bartłomiej Plewnia will define them
    val status: String, // TODO state or status?
    val cpuUsage: BasicMetric,
    val memoryUsage: BasicMetric,
    var alertType: AlertType?,
    var alert: Boolean?
)