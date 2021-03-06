package pl.edu.agh.dockerbuddy.model.entity

import com.fasterxml.jackson.annotation.JsonAlias
import lombok.ToString
import java.time.Instant
import java.time.LocalDateTime
import java.time.ZoneOffset
import javax.persistence.*
import javax.validation.constraints.NotBlank
import javax.validation.constraints.Pattern

@ToString
@Table(name = "host")
@Entity
class Host(
    @field:NotBlank
    @Column(name = "host_name", unique = true, nullable = false)
    @JsonAlias("host_name")
    var hostName: String? = null,

    @field:NotBlank
    @field:Pattern(regexp = "^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(\\.(?!$)|$)){4}$")
    @Column(name = "ip_address", nullable = false)
    var ip: String? = null,

    @OneToMany(cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.EAGER)
    var hostPercentRules: MutableSet<PercentMetricRule> = mutableSetOf(),

    @OneToMany(cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.EAGER)
    var hostBasicRules: MutableSet<BasicMetricRule> = mutableSetOf(),

    @OneToMany(cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.EAGER)
    var containers: MutableSet<ContainerReport> = mutableSetOf(),

    @Column(name = "timeout_interval")
    var timeoutInterval: Int? = null // TODO ?

): BaseIdEntity() {
    @Column(name = "is_timed_out", nullable = false)
    var isTimedOut = false

    @Column(name = "creation_date", nullable = false)
    var creationDate: String = LocalDateTime.now().toInstant(ZoneOffset.UTC).toString()
}
