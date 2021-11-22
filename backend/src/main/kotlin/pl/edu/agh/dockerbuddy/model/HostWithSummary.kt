package pl.edu.agh.dockerbuddy.model

import com.fasterxml.jackson.annotation.JsonAlias
import com.fasterxml.jackson.annotation.JsonProperty
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
    @field:JsonAlias("hostRules") // TODO unify variable names
    @get:JsonProperty("hostRules") // TODO unify variable names
    val hostPercentRules: List<PercentMetricRule>,
    var hostBasicRules: List<BasicMetricRule>,
    val containersReports: List<ContainerReport>,
    val hostSummary: HostSummary?
)