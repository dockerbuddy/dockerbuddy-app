package pl.edu.agh.dockerbuddy.controller

import io.reactivex.internal.util.ExceptionHelper
import io.swagger.annotations.*
import kotlinx.coroutines.*
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import pl.edu.agh.dockerbuddy.controller.response.DefaultResponse
import pl.edu.agh.dockerbuddy.controller.response.ResponseType
import pl.edu.agh.dockerbuddy.influxdb.AlertRecord
import pl.edu.agh.dockerbuddy.influxdb.CustomFluxRecord
import pl.edu.agh.dockerbuddy.influxdb.InfluxDbProxy

@Api(tags = ["Influx"])
@CrossOrigin
@RestController
@RequestMapping("/api/v2/influxdb")
class InfluxController (
    val influxDbProxy: InfluxDbProxy
){
    private val logger = LoggerFactory.getLogger(InfluxController::class.java)

    @ApiOperation(value = "Get host's metrics form a range of time")
    @ApiImplicitParams(value = [
        ApiImplicitParam(name = "metricType", value = "Type of a metric", dataTypeClass = String::class),
        ApiImplicitParam(name = "hostId", value = "Id of a host", dataTypeClass = Long::class, example = "1"),
        ApiImplicitParam(name = "start", value = "Start time, eg -1d, -10m, etc.", dataTypeClass = String::class),
        ApiImplicitParam(name = "end", value = "End time, must be greater than start time", dataTypeClass = String::class),
    ])
    @GetMapping(produces = ["application/json"])
    fun getHostMetricFromRange(
        @RequestParam metricType: String,
        @RequestParam hostId: Long,
        @RequestParam start: String, // TODO choose time representation and apply regex
        @RequestParam(required = false, defaultValue = "now()") end: String // TODO choose time representation and apply regex
    ): ResponseEntity<DefaultResponse<List<CustomFluxRecord>>> {
        logger.info("GET /api/v2/influxdb")
        logger.debug("getHostMetricFromRange: " +
                "metricType: $metricType, " +
                "hostId: $hostId, " +
                "start: $start, " +
                "end: $end"
        )

        var response: ResponseEntity<DefaultResponse<List<CustomFluxRecord>>>
        runBlocking {
            val result = influxDbProxy.queryInfluxDb(metricType, hostId, start, end)
                response =  ResponseEntity.status(HttpStatus.OK)
                    .body(DefaultResponse(ResponseType.SUCCESS, "Influx records fetched", result))
        }
        return response
    }

    @GetMapping("/alerts")
    fun getAlerts(
            @RequestParam(required = false) hostId: Long?,
            @RequestParam start: String, // TODO choose time representation and apply regex
            @RequestParam(required = false) end: String? // TODO choose time representation and apply regex
    ): ResponseEntity<DefaultResponse<List<AlertRecord>>> {
        logger.info("GET /api/v2/influxdb/alerts")
        logger.debug("getAlerts: " +
                "hostId: $hostId, " +
                "start: $start, " +
                "end: $end, "
        )

        var response: ResponseEntity<DefaultResponse<List<AlertRecord>>>
        runBlocking {
            val result = influxDbProxy.queryAlerts(hostId, start, end)
            response =  ResponseEntity.status(HttpStatus.OK)
                    .body(DefaultResponse(ResponseType.SUCCESS, "Influx records fetched", result))
        }
        return response
    }
}