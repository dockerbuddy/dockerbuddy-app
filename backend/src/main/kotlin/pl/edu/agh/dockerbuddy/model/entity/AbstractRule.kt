package pl.edu.agh.dockerbuddy.model.entity

import com.fasterxml.jackson.annotation.JsonAlias
import lombok.ToString
import pl.edu.agh.dockerbuddy.model.RuleType
import java.lang.IllegalArgumentException
import javax.persistence.*
import javax.validation.constraints.Max
import javax.validation.constraints.Min

@ToString
@Table(name = "abstract_rule")
@Entity
class AbstractRule (
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
): BaseLongIdEntity()  {

    init {
        if (warnLevel >= criticalLevel) {
            throw IllegalArgumentException("warnLevel cannot be greater than nor equal to criticalLevel")
        }
    }
}