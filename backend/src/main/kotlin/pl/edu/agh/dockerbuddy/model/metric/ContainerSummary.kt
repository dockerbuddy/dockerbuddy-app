package pl.edu.agh.dockerbuddy.model.metric

import lombok.ToString
import pl.edu.agh.dockerbuddy.model.alert.AlertType
import pl.edu.agh.dockerbuddy.model.enums.ContainerState
import pl.edu.agh.dockerbuddy.model.enums.ReportStatus

@ToString
data class ContainerSummary(
    val id: String,
    val name: String,
    val image: String,
    val state: ContainerState,
    val metrics: List<PercentMetric>,
    var alertType: AlertType?,
    var reportStatus: ReportStatus?
)