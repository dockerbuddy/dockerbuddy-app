package pl.edu.agh.dockerbuddy.model

import javax.persistence.*

@Table(name = "host")
@Entity
class Host(
    @Column(name = "host_name", nullable = false)
    var hostName: String? = null
): BaseLongIdEntity() {

    @OneToMany(cascade = [CascadeType.ALL], orphanRemoval = true)
    @JoinColumn(name = "host_id", nullable = false)
    var rules: MutableList<AbstractRule> = mutableListOf()
}