package pl.edu.agh.dockerbuddy.controller
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.CrossOrigin
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@Api(tags = ["Hello World"])
@CrossOrigin
@RestController
@RequestMapping("/hello")
class HelloController {
    @Value("\${influxdb.token}")
    lateinit var token: String

    @Value("\${influxdb.organization}")
    lateinit var organization: String

    @Value("\${influxdb.bucket}")
    lateinit var bucket: String

    @ApiOperation(value = "Returns token, organization and bucket from influxDB")
    @GetMapping(produces = ["text/plain"])
    fun getCredentials() = "$token\n$organization\n$bucket"
}