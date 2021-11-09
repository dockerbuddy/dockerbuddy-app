package pl.edu.agh.dockerbuddy.model

import lombok.ToString
import pl.edu.agh.dockerbuddy.model.entity.ContainerRule
import pl.edu.agh.dockerbuddy.model.entity.MetricRule
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import java.util.*

@ToString
data class HostWithSummary(
    val id: UUID,
    val hostName: String,
    val ip: String,
    val hostRules: List<MetricRule>,
    val containersRules: List<ContainerRule>,
    val hostSummary: HostSummary?
)