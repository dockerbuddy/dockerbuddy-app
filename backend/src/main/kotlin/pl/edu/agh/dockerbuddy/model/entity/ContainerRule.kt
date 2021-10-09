package pl.edu.agh.dockerbuddy.model.entity

import com.fasterxml.jackson.annotation.JsonAlias
import lombok.ToString
import pl.edu.agh.dockerbuddy.model.RuleType
import javax.persistence.*

@ToString
@Table(name = "container_rule")
@Entity
class ContainerRule(
    @Column(name = "container_id", nullable = false)
    var containerId: String
): BaseLongIdEntity() {
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    @JsonAlias("ruleType")
    var type: RuleType = RuleType.ContainerState
}