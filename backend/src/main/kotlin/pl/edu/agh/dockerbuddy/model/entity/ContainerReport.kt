package pl.edu.agh.dockerbuddy.model.entity

import lombok.ToString
import pl.edu.agh.dockerbuddy.model.enums.ReportStatus
import javax.persistence.*

@ToString
@Table(name = "container_report")
@Entity
class ContainerReport(
    @Column(name = "container_name", nullable = false)
    var containerName: String,

    @Enumerated(EnumType.STRING)
    @Column(name = "report_status", nullable = false)
    var reportStatus: ReportStatus
): BaseIdEntity()