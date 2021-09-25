package pl.edu.agh.dockerbuddy.controller

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import pl.edu.agh.dockerbuddy.controller.response.DefaultResponse
import pl.edu.agh.dockerbuddy.controller.response.ResponseType
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.service.HostService
import javax.persistence.EntityNotFoundException
import javax.validation.Valid

@CrossOrigin
@RestController
@RequestMapping("/api/v2/hosts")
class HostController (
    val hostService: HostService
) {

    @PostMapping
    fun addHost(@RequestBody @Valid host: Host): ResponseEntity<DefaultResponse> {
            val savedHost = hostService.addHost(host)
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(DefaultResponse(ResponseType.SUCCESS, "Host added", savedHost))
    }

    @GetMapping
    fun getHostsWithSummary(): ResponseEntity<DefaultResponse> {
            val hostsWithSummary = hostService.getHostsWithSummary()
            if (hostsWithSummary.isEmpty()) throw EntityNotFoundException("No hosts were found")
            return ResponseEntity.status(HttpStatus.OK)
                .body(DefaultResponse(ResponseType.SUCCESS, "Hosts fetched", hostsWithSummary))
    }

    @DeleteMapping("/{id}")
    fun deleteHost(@PathVariable id: Long): ResponseEntity<DefaultResponse> {
        hostService.deleteHost(id)
        return ResponseEntity.status(HttpStatus.OK)
            .body(DefaultResponse(ResponseType.SUCCESS, "Host deleted", null))
    }

    @PutMapping("/{id}")
    fun updateHost(@PathVariable id: Long, @RequestBody @Valid host: Host): ResponseEntity<DefaultResponse> {
        val updatedHost = hostService.updateHost(id, host)
        return ResponseEntity.status(HttpStatus.OK)
            .body(DefaultResponse(ResponseType.SUCCESS, "Host updated", updatedHost))
    }
}