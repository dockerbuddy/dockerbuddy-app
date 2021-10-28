package pl.edu.agh.dockerbuddy.model.metric

import com.fasterxml.jackson.annotation.JsonAlias
import lombok.ToString
import pl.edu.agh.dockerbuddy.model.alert.AlertType
import pl.edu.agh.dockerbuddy.model.enums.ContainerState

@ToString
data class ContainerSummary(
    val id: String,
    val name: String,
    val image: String,
    @JsonAlias("state") val status: ContainerState,
    val metrics: List<BasicMetric>,
    var alertType: AlertType?,
)