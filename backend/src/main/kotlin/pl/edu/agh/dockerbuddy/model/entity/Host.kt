package pl.edu.agh.dockerbuddy.model.entity

import javax.persistence.*
import javax.validation.constraints.NotBlank

@Table(name = "host")
@Entity
class Host(
    @field:NotBlank
    //TODO: @Pattern(regexp = "[a-zA-Z0-9]")
    @Column(name = "host_name", nullable = false)
    var hostName: String? = null
): BaseLongIdEntity() {

    @OneToMany(mappedBy = "host", orphanRemoval = true)
    var rules: MutableList<AbstractRule> = mutableListOf()
}