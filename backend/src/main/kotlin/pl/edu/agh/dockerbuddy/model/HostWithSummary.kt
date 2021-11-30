package pl.edu.agh.dockerbuddy.model

import lombok.ToString
import pl.edu.agh.dockerbuddy.model.entity.BasicMetricRule
import pl.edu.agh.dockerbuddy.model.entity.ContainerReport
import pl.edu.agh.dockerbuddy.model.entity.PercentMetricRule
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import java.util.*
import javax.validation.constraints.Pattern

@ToString
data class HostWithSummary(
    val id: UUID,
    val hostName: String,

    @field:Pattern(regexp = "^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(\\.(?!\$)|\$)){4}\$")
    val ip: String,

    val isTimedOut: Boolean,
    val hostPercentRules: List<PercentMetricRule>,
    var hostBasicRules: List<BasicMetricRule>,
    val containersReports: List<ContainerReport>,
    val hostSummary: HostSummary?
)