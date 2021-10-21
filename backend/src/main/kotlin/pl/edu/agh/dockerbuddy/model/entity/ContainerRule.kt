package pl.edu.agh.dockerbuddy.model.entity

import com.fasterxml.jackson.annotation.JsonAlias
import lombok.ToString
import pl.edu.agh.dockerbuddy.model.alert.AlertType
import pl.edu.agh.dockerbuddy.model.enums.RuleType
import javax.persistence.*

@ToString
@Table(name = "container_rule")
@Entity
class ContainerRule(
    @JsonAlias("ruleType")
    type: RuleType,

    @Column(name = "container_name", nullable = false)
    var containerName: String,

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false)
    var alertType: AlertType // type of the alert to be thrown upon rule violation. Chosen by user
): AbstractRule(type)