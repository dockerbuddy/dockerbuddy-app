package pl.edu.agh.dockerbuddy.model.entity

import com.fasterxml.jackson.annotation.JsonAlias
import lombok.ToString
import pl.edu.agh.dockerbuddy.model.enums.RuleType
import javax.persistence.Column
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.MappedSuperclass

@ToString
@MappedSuperclass
abstract class AbstractRule(
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    @JsonAlias("ruleType")
    var type: RuleType = RuleType.ContainerState
): BaseLongIdEntity()