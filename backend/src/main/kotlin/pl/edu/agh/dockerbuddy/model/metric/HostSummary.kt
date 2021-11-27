package pl.edu.agh.dockerbuddy.model.metric

import lombok.ToString
import java.util.*
import javax.validation.constraints.Pattern

@ToString
data class HostSummary(
    val id: UUID,

    @field:Pattern(regexp = "^[1-9]\\d{3}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z\$")
    val timestamp: String,

    val senderInterval: Long, // in seconds
    val percentMetrics: List<PercentMetric>,
    val basicMetrics: List<BasicMetric>,
    val containers: List<ContainerSummary>
)
