package pl.edu.agh.dockerbuddy.model.entity

import javax.persistence.*

@MappedSuperclass
class BaseLongIdEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", nullable = false)
    var id: Long? = null

    /**
     * Since the id can only be set by the DB, this method will return true only if the entity has been saved.
     */
    fun isNew(): Boolean = id == null
}