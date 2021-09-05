package pl.edu.agh.dockerbuddy.controller

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import pl.edu.agh.dockerbuddy.controller.response.DefaultResponse
import pl.edu.agh.dockerbuddy.controller.response.ResponseType
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.service.HostService

@RestController
@RequestMapping("/api/v2/hosts")
class HostController (
    val hostService: HostService
) {

    @PostMapping
    fun addHost(@RequestBody host: Host): ResponseEntity<DefaultResponse> {
        return try {
            val savedHost = hostService.addHost(host)
            ResponseEntity.status(HttpStatus.CREATED)
                .body(DefaultResponse(ResponseType.SUCCESS, "Host added", savedHost))
        } catch (e: Exception){
            ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(DefaultResponse(ResponseType.ERROR, e.message.toString(), null))
        }
    }

    @GetMapping
    fun getHostsWithSummary(): ResponseEntity<DefaultResponse> {
        return try {
            val hostWithSummary = hostService.getHostsWithSummary()
            ResponseEntity.status(HttpStatus.OK)
                .body(DefaultResponse(ResponseType.SUCCESS, "Host added", hostWithSummary))
        } catch (e: Exception){
            ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED)
                .body(DefaultResponse(ResponseType.ERROR, e.message.toString(), null))
        }
    }
}