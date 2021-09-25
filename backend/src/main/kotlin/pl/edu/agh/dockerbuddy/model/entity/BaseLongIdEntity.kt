package pl.edu.agh.dockerbuddy.model.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import lombok.ToString
import javax.persistence.*

@ToString
@MappedSuperclass
class BaseLongIdEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    var id: Long? = null

    /**
     * Since the id can only be set by the DB, this method will return true only if the entity has been saved.
     */
    @JsonIgnore
    fun isNew(): Boolean = id == null
}