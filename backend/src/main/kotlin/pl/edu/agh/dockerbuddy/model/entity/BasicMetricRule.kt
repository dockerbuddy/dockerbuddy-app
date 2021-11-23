package pl.edu.agh.dockerbuddy.model.entity

import lombok.ToString
import pl.edu.agh.dockerbuddy.model.enums.RuleType
import javax.persistence.*
import javax.validation.constraints.Max
import javax.validation.constraints.Min

@ToString
@Table(name = "basic_metric_rule")
@Entity
class BasicMetricRule (
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    var type: RuleType,

    @field:Min(0)
    @Column(name = "warn_level", nullable = false)
    var warnLevel: Long,

    @field:Min(0)
    @Column(name = "critical_level", nullable = false)
    var criticalLevel: Long
): BaseIdEntity () {
    init {
        require (criticalLevel >= warnLevel) {
            "warnLevel cannot be greater than nor equal to criticalLevel"
        }

        require(type in listOf(RuleType.NETWORK_IN, RuleType.NETWORK_OUT)) {
            "Basic metric rule type must be one of the following: NETWORK_IN, NETWORK_OUT"
        }
    }
}