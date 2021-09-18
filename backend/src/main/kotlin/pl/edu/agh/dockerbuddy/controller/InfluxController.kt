package pl.edu.agh.dockerbuddy.controller

import io.reactivex.internal.util.ExceptionHelper
import kotlinx.coroutines.*
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import pl.edu.agh.dockerbuddy.controller.response.DefaultResponse
import pl.edu.agh.dockerbuddy.controller.response.ResponseType
import pl.edu.agh.dockerbuddy.influxdb.InfluxDbProxy

@CrossOrigin
@RestController
@RequestMapping("/api/v2/influxdb")
class InfluxController (
    val influxDbProxy: InfluxDbProxy
){
    private val logger = LoggerFactory.getLogger(ExceptionHelper::class.java)

    @GetMapping
    fun getHostMetricFromRange(
        @RequestParam metricType: String,
        @RequestParam hostId: Long,
        @RequestParam start: String, // TODO choose time representation and apply regex
        @RequestParam(required = false) end: String? // TODO choose time representation and apply regex
    ): ResponseEntity<DefaultResponse> {
        logger.info("[GET /api/v2/influxdb] getHostMetricFromRange: " +
                "metricType: $metricType, " +
                "hostId: $hostId, " +
                "start: $start, " +
                "end: $end"
        )

        var response: ResponseEntity<DefaultResponse>
        runBlocking {
            val result = influxDbProxy.queryInfluxDb(metricType, hostId, start, end)
                response =  ResponseEntity.status(HttpStatus.OK)
                    .body(DefaultResponse(ResponseType.SUCCESS, "Influx records fetched", result))
        }
        return response
    }
}