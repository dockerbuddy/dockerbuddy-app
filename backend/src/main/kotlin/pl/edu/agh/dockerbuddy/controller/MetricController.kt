package pl.edu.agh.dockerbuddy.controller

import io.swagger.annotations.Api
import io.swagger.annotations.ApiImplicitParam
import io.swagger.annotations.ApiImplicitParams
import io.swagger.annotations.ApiOperation
import kotlinx.coroutines.runBlocking
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import pl.edu.agh.dockerbuddy.controller.response.DefaultResponse
import pl.edu.agh.dockerbuddy.controller.response.ResponseType
import pl.edu.agh.dockerbuddy.influxdb.FluxRecord
import pl.edu.agh.dockerbuddy.influxdb.InfluxDbProxy
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import pl.edu.agh.dockerbuddy.service.MetricService
import java.util.*
import javax.validation.Valid

@Api(tags = ["Metrics"])
@RestController
@RequestMapping("/api/v2/metrics")
class MetricController(
    val metricService: MetricService,
    val influxDbProxy: InfluxDbProxy
) {

    private val logger = LoggerFactory.getLogger(MetricController::class.java)

    @ApiOperation(value = "Get host's metrics form a range of time")
    @ApiImplicitParams(value = [
        ApiImplicitParam(
            name = "metricType",
            value = "Type of a metric",
            dataTypeClass = String::class
        ),
        ApiImplicitParam(
            name = "hostId",
            value = "Id of a host",
            dataTypeClass = UUID::class,
            example = "123e4567-e89b-12d3-a456-426614174000"
        ),
        ApiImplicitParam(
            name = "start",
            value = "Start time, eg -1d, -10m, etc.",
            dataTypeClass = String::class
        ),
        ApiImplicitParam(
            name = "end",
            value = "End time, must be greater than start time",
            dataTypeClass = String::class
        )
    ])
    @GetMapping(produces = ["application/json"])
    fun getHostMetricFromRange(
        @RequestParam metricType: String,
        @RequestParam hostId: UUID,
        @RequestParam /*@Pattern(regexp = DATETIME_REGEX)*/ start: String,
        @RequestParam(required = false, defaultValue = "now()") end: String // FIXME default value that violates pattern
    ): ResponseEntity<DefaultResponse<List<FluxRecord>>> {
        logger.info("GET /api/v2/influxdb")
        logger.debug("getHostMetricFromRange: " +
                "metricType: $metricType, " +
                "hostId: $hostId, " +
                "start: $start, " +
                "end: $end"
        )

        var response: ResponseEntity<DefaultResponse<List<FluxRecord>>>
        runBlocking {
            val result = influxDbProxy.queryMetric(metricType, hostId, start, end)
            response =  ResponseEntity.status(HttpStatus.OK)
                .body(DefaultResponse(ResponseType.SUCCESS, "Influx records fetched", result))
        }
        return response
    }

    @ApiOperation(value = "Add new metric reading")
    @PostMapping(produces = ["application/json"])
    fun addMetric(@RequestBody @Valid hostSummary: HostSummary): ResponseEntity<DefaultResponse<Any?>> {
            metricService.processMetrics(hostSummary, hostSummary.id)
            return ResponseEntity.status(HttpStatus.OK)
                    .body(DefaultResponse(ResponseType.SUCCESS, "Metric uploaded", null))
    }
}
