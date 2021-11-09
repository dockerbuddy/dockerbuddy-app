package pl.edu.agh.dockerbuddy.model.entity

import com.fasterxml.jackson.annotation.JsonIgnore
import lombok.ToString
import org.hibernate.annotations.GenericGenerator
import java.util.*
import javax.persistence.*

@ToString
@MappedSuperclass
abstract class BaseIdEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY, generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", nullable = false)
    var id: UUID? = null

    /**
     * Since the id can only be set by the DB, this method will return true only if the entity has been saved.
     */
    @JsonIgnore
    fun isNew(): Boolean = id == null
}