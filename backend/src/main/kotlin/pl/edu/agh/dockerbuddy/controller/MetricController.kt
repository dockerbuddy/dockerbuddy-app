package pl.edu.agh.dockerbuddy.controller

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import pl.edu.agh.dockerbuddy.controller.response.DefaultResponse
import pl.edu.agh.dockerbuddy.controller.response.ResponseType
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import pl.edu.agh.dockerbuddy.service.MetricService

@RestController
@RequestMapping("/api/v2/metrics")
class MetricController(@Autowired val metricService: MetricService) {

    @PostMapping
    @RequestMapping("/{hostId}")
    fun addMetric(@RequestBody hostSummary: HostSummary, @PathVariable hostId: String): ResponseEntity<DefaultResponse> {
        return try {
            metricService.postMetric(hostSummary, hostId.toLong())
            ResponseEntity.status(HttpStatus.OK)
                    .body(DefaultResponse(ResponseType.SUCCESS, "Metric uploaded", null))
        } catch (e: Exception){
            ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                    .body(DefaultResponse(ResponseType.ERROR, e.toString(), null))
        }
    }
}