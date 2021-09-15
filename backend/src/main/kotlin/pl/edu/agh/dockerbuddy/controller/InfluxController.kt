package pl.edu.agh.dockerbuddy.controller

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import pl.edu.agh.dockerbuddy.controller.response.DefaultResponse
import pl.edu.agh.dockerbuddy.controller.response.ResponseType
import pl.edu.agh.dockerbuddy.influxdb.InfluxDbProxy

@RestController
@RequestMapping("/api/v2/influxdb")
class InfluxController (
    val influxDbProxy: InfluxDbProxy
){

    @GetMapping
    suspend fun getHostMetricFromRange(
        @RequestParam metricType: String,
        @RequestParam hostId: Long,
        @RequestParam start: String, // TODO choose time representation and apply regex
        @RequestParam(required = false) end: String? // TODO choose time representation and apply regex
    ): ResponseEntity<DefaultResponse> {

        val result = influxDbProxy.queryInfluxDb(metricType, hostId, start, end)
        return ResponseEntity.status(HttpStatus.OK)
            .body(DefaultResponse(ResponseType.SUCCESS, "Influx records fetched", result))
    }
}