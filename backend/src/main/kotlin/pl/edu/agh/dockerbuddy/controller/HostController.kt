package pl.edu.agh.dockerbuddy.controller

import io.reactivex.internal.util.ExceptionHelper
import org.slf4j.LoggerFactory
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import pl.edu.agh.dockerbuddy.controller.response.DefaultResponse
import pl.edu.agh.dockerbuddy.controller.response.ResponseType
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.service.HostService

@CrossOrigin
@RestController
@RequestMapping("/api/v2/hosts")
class HostController (
    val hostService: HostService
) {

    @PostMapping
    fun addHost(@RequestBody host: Host): ResponseEntity<DefaultResponse> {
            val savedHost = hostService.addHost(host)
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(DefaultResponse(ResponseType.SUCCESS, "Host added", savedHost))
    }

    @GetMapping
    fun getHostsWithSummary(): ResponseEntity<DefaultResponse> {
            val hostWithSummary = hostService.getHostsWithSummary()
            return ResponseEntity.status(HttpStatus.OK)
                .body(DefaultResponse(ResponseType.SUCCESS, "Hosts fetched", hostWithSummary))
    }

    @DeleteMapping("/{id}")
    fun deleteHost(@PathVariable id: Long): ResponseEntity<DefaultResponse> {
        hostService.deleteHost(id)
        return ResponseEntity.status(HttpStatus.OK)
            .body(DefaultResponse(ResponseType.SUCCESS, "Host deleted", null))
    }

    @PutMapping("/{id}")
    fun updateHost(@PathVariable id: Long, @RequestBody host: Host): ResponseEntity<DefaultResponse> {
        val updatedHost = hostService.updateHost(id, host)
        return ResponseEntity.status(HttpStatus.OK)
            .body(DefaultResponse(ResponseType.SUCCESS, "Host updated", updatedHost))
    }
}