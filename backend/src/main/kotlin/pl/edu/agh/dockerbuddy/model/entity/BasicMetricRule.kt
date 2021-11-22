package pl.edu.agh.dockerbuddy.model.entity

import lombok.ToString
import pl.edu.agh.dockerbuddy.model.enums.RuleType
import javax.persistence.*

@ToString
@Table(name = "basic_metric_rule")
@Entity
class BasicMetricRule (
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    var type: RuleType,

    @Column(name = "transfer_limit", nullable = false)
    var limit: Long // in bytes
): BaseIdEntity () {
    init {
        require(type in listOf(RuleType.NETWORK_IN, RuleType.NETWORK_OUT)) {
            "Basic metric rule type must be one of the following: NETWORK_IN, NETWORK_OUT"
        }
    }
}