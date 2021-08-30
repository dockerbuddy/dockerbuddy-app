package pl.edu.agh.dockerbuddy.model.entity

import pl.edu.agh.dockerbuddy.model.RuleType
import java.lang.IllegalArgumentException
import javax.persistence.*
import javax.validation.constraints.Max
import javax.validation.constraints.Min

@Table(name = "abstract_rule")
@Entity
class AbstractRule (
        @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    var type: RuleType,

        @field:Min(0)
    @field:Max(100)
    @Column(name = "warn_level", nullable = false)
    var warnLevel: Int,

        @field:Min(0)
    @field:Max(100)
    @Column(name = "critical_level", nullable = false)
    var criticalLevel: Int,

        @ManyToOne(cascade = [CascadeType.ALL], fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "host_id", nullable = false)
    var host: Host
): BaseLongIdEntity()  {

    init {
        if (warnLevel >= criticalLevel) {
            throw IllegalArgumentException("warnLevel cannot be greater than nor equal to criticalLevel")
        }
    }
}