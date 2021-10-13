package pl.edu.agh.dockerbuddy.controller

import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import pl.edu.agh.dockerbuddy.controller.response.DefaultResponse
import pl.edu.agh.dockerbuddy.controller.response.ResponseType
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import pl.edu.agh.dockerbuddy.service.MetricService
import javax.validation.Valid

@Api(tags = ["Metrics"])
@CrossOrigin
@RestController
@RequestMapping("/api/v2/metrics")
class MetricController(val metricService: MetricService) {

    @ApiOperation(value = "Add new metric reading")
    @PostMapping(produces = ["application/json"])
    fun addMetric(@RequestBody @Valid hostSummary: HostSummary): ResponseEntity<DefaultResponse<Any?>> {
            metricService.postMetric(hostSummary, hostSummary.id)
            return ResponseEntity.status(HttpStatus.OK)
                    .body(DefaultResponse(ResponseType.SUCCESS, "Metric uploaded", null))
    }
}
