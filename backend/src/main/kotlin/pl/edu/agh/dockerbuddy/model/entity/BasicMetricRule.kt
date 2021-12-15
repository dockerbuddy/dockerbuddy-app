package pl.edu.agh.dockerbuddy.model.entity

import lombok.ToString
import pl.edu.agh.dockerbuddy.model.enums.BasicMetricType
import javax.persistence.*
import javax.validation.constraints.Min

// TODO common interface for basic and percent rules

@ToString
@Table(name = "basic_metric_rule")
@Entity
class BasicMetricRule(
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    var type: BasicMetricType,

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
    }
}