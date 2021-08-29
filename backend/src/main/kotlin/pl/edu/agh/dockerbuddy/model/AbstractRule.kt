package pl.edu.agh.dockerbuddy.model

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

    @Min(0)
    @Max(100)
    @Column(name = "critical_level", nullable = false)
    var criticalLevel: Int,

    @Min(0)
    @Max(100)
    @Column(name = "warn_level", nullable = false)
    var warnLevel: Int,

    @ManyToOne(cascade = [CascadeType.ALL], fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "host_id", nullable = false)
    var host: Host
): BaseLongIdEntity()  {
    init {
        if (warnLevel >= criticalLevel) {
            throw IllegalArgumentException("warnLevel cannot exceed criticalLevel")
        }
    }
}