package pl.edu.agh.dockerbuddy.model

import lombok.ToString
import pl.edu.agh.dockerbuddy.model.entity.BasicMetricRule
import pl.edu.agh.dockerbuddy.model.entity.ContainerReport
import pl.edu.agh.dockerbuddy.model.entity.PercentMetricRule
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import java.util.*

@ToString
data class HostWithSummary(
    val id: UUID,
    val hostName: String,
    val ip: String,
    val hostPercentRules: List<PercentMetricRule>,
    var hostBasicRules: List<BasicMetricRule>,
    val containersReports: List<ContainerReport>,
    val hostSummary: HostSummary?
)