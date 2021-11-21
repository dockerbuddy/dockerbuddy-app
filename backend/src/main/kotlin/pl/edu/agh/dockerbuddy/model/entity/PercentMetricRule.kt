package pl.edu.agh.dockerbuddy.model.entity

import com.fasterxml.jackson.annotation.JsonAlias
import lombok.ToString
import pl.edu.agh.dockerbuddy.model.enums.RuleType
import java.lang.IllegalArgumentException
import javax.persistence.*
import javax.validation.constraints.Max
import javax.validation.constraints.Min

@ToString
@Table(name = "percent_metric_rule")
@Entity
class PercentMetricRule (
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    @JsonAlias("ruleType")
    var type: RuleType,

    @field:Min(0)
    @field:Max(100)
    @Column(name = "warn_level", nullable = false)
    var warnLevel: Int,

    @field:Min(0)
    @field:Max(100)
    @Column(name = "critical_level", nullable = false)
    var criticalLevel: Int
): BaseIdEntity()  {

    init {
        require (warnLevel >= criticalLevel) {
            "warnLevel cannot be greater than nor equal to criticalLevel"
        }

        require(type in listOf(RuleType.CPU_USAGE, RuleType.MEMORY_USAGE, RuleType.DISK_USAGE)) {
            "Percent metric rule type must be one of the following: CPU_USAGE, MEMORY_USAGE, DISK_USAGE"
        }
    }


}