package pl.edu.agh.dockerbuddy.model.entity

import com.fasterxml.jackson.annotation.JsonAlias
import lombok.ToString
import pl.edu.agh.dockerbuddy.model.alert.AlertType
import pl.edu.agh.dockerbuddy.model.types.RuleType
import javax.persistence.*

@ToString
@Table(name = "container_rule")
@Entity
class ContainerRule(
    @Column(name = "container_name", nullable = false)
    var containerName: String,

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false)
    var alertType: AlertType // type of the alert to be thrown upon rule violation. Chosen by user
): BaseLongIdEntity() {
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    @JsonAlias("ruleType")
    var type: RuleType = RuleType.ContainerState
}