package pl.edu.agh.dockerbuddy.controller

import io.swagger.annotations.*
import kotlinx.coroutines.*
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import pl.edu.agh.dockerbuddy.controller.response.DefaultResponse
import pl.edu.agh.dockerbuddy.controller.response.ResponseType
import pl.edu.agh.dockerbuddy.influxdb.*
import java.util.*

@Api(tags = ["Influx"])
@RestController
@Validated
@RequestMapping("/api/v2/influxdb")
class InfluxController (
    val influxDbProxy: InfluxDbProxy
){
    private val logger = LoggerFactory.getLogger(InfluxController::class.java)

    companion object {
        //todo IMPROVE REGEX TO ACCEPT DATE AS ISOSTRING
        const val DATETIME_REGEX: String = "^[1-9]\\d{3}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z\$"
    }

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

    @ApiOperation(value = "Get host's alerts form a range of time")
    @ApiImplicitParams(value = [
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
        ),
        ApiImplicitParam(
            name = "fetchAll",
            value = "Fetch all alerts. If false, 'read' must be specified",
            dataTypeClass = Boolean::class
        ),
        ApiImplicitParam(
            name = "read",
            value = "Fetch specific alerts: true for read only, false for unread only",
            dataTypeClass = String::class
        )
    ])
    @GetMapping("/alerts")
    fun getAlerts(
        @RequestParam(required = false) hostId: UUID?,
        @RequestParam /*@Pattern(regexp = DATETIME_REGEX)*/ (required = true) start: String,
        @RequestParam(required = false) end: String?, // FIXME default value that violates pattern
        @RequestParam(required = true) fetchAll: Boolean,
        @RequestParam(required = false) read: Boolean?
    ): ResponseEntity<DefaultResponse<List<AlertRecord>>> {
        logger.info("GET /api/v2/influxdb/alerts")
        logger.debug("getAlerts: " +
                "hostId: $hostId, " +
                "start: $start, " +
                "end: $end, " +
                "fetchAll: $fetchAll, " +
                "read: $read "
        )

        var response: ResponseEntity<DefaultResponse<List<AlertRecord>>>
        runBlocking {
            val result = influxDbProxy.queryAlerts(hostId, start, end, fetchAll, read)
            response =  ResponseEntity.status(HttpStatus.OK)
                    .body(DefaultResponse(ResponseType.SUCCESS, "Influx records fetched", result))
        }
        return response
    }

    @ApiOperation(value = "Mark alerts as read")
    @PutMapping("/alerts")
    fun readAlerts(@RequestBody alertList: List<AlertRecord>): ResponseEntity<DefaultResponse<Int>> {
        logger.info("PUT /api/v2/influxdb/alerts")
        var response: ResponseEntity<DefaultResponse<Int>>
        runBlocking {
            val result = influxDbProxy.saveAlerts(alertList)
            response =  ResponseEntity.status(HttpStatus.OK)
                .body(DefaultResponse(ResponseType.SUCCESS, "Alerts marked as read", influxDbProxy.alertCounter))
        }
        return response
    }

    @ApiOperation(value = "Get alerts counter value")
    @GetMapping("/alertsCounter")
    fun getAlertsCounter(): ResponseEntity<DefaultResponse<Int>> {
        return ResponseEntity.status(HttpStatus.OK)
            .body(DefaultResponse(ResponseType.SUCCESS, "Alerts counter value fetched", influxDbProxy.alertCounter))
    }
}