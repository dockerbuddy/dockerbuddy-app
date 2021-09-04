package pl.edu.agh.dockerbuddy.model.entity

import javax.persistence.*
import javax.validation.constraints.NotBlank
import javax.validation.constraints.Pattern

@Table(name = "host")
@Entity
class Host(
    @field:NotBlank
    @Column(name = "host_name", unique= true, nullable = false)
    var hostName: String? = null,
    @field:NotBlank
    @field:Pattern(regexp = "^(([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])(\\.(?!$)|$)){4}$")
    @Column(name = "ip_address", nullable = false)
    var ip: String? = null,
    @OneToMany(cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.EAGER)
    var rules: MutableList<AbstractRule> = mutableListOf()
): BaseLongIdEntity()