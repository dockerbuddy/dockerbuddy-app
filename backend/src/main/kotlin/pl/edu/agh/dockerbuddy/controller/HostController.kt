package pl.edu.agh.dockerbuddy.controller

import io.swagger.annotations.*
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import pl.edu.agh.dockerbuddy.controller.response.DefaultResponse
import pl.edu.agh.dockerbuddy.controller.response.ResponseType
import pl.edu.agh.dockerbuddy.model.HostWithSummary
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.service.HostService
import javax.validation.Valid

@Api(tags = ["Hosts"])
@RestController
@RequestMapping("/api/v2/hosts")
class HostController (
    val hostService: HostService
) {

    @ApiOperation(value = "Add new host",)
    @ApiResponses(value = [
        ApiResponse(code = 201, message = "Created")
    ])
    @PostMapping(produces = ["application/json"])
    fun addHost(@RequestBody @Valid host: Host): ResponseEntity<DefaultResponse<Host>> {
            val savedHost = hostService.addHost(host)
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(DefaultResponse(ResponseType.SUCCESS, "Host added", savedHost))
    }

    @ApiOperation(value = "Get all hosts with their summaries")
    @GetMapping(produces = ["application/json"])
    fun getAllHostsWithSummaries(): ResponseEntity<DefaultResponse<List<HostWithSummary>>> {
            val hostsWithSummary = hostService.getAllHostsWithSummaries()
            return ResponseEntity.status(HttpStatus.OK)
                .body(DefaultResponse(ResponseType.SUCCESS, "Hosts fetched", hostsWithSummary))
    }

    @ApiOperation(value = "Get specific host with summary")
    @ApiImplicitParams(value = [
        ApiImplicitParam(name = "id", value = "Id of a host", dataTypeClass = Long::class, example = "1")
    ])
    @GetMapping(value =["/{id}"], produces = ["application/json"])
    fun getHostWithSummary(@PathVariable id: Long): ResponseEntity<DefaultResponse<HostWithSummary>> {
        val hostsWithSummary = hostService.getHostWithSummary(id)
        return ResponseEntity.status(HttpStatus.OK)
            .body(DefaultResponse(ResponseType.SUCCESS, "Hosts fetched", hostsWithSummary))
    }

    @ApiOperation(value = "Delete host")
    @ApiImplicitParams(value = [
           ApiImplicitParam(name = "id", value = "Id of a host", dataTypeClass = Long::class, example = "1")
    ])
    @DeleteMapping(value =["/{id}"], produces = ["application/json"])
    fun deleteHost(@PathVariable id: Long): ResponseEntity<DefaultResponse<Any?>> {
        hostService.deleteHost(id)
        return ResponseEntity.status(HttpStatus.OK)
            .body(DefaultResponse(ResponseType.SUCCESS, "Host deleted", null))
    }

    @ApiOperation(value = "Update host")
    @ApiImplicitParams(value = [
        ApiImplicitParam(name = "id", value = "Id of a host", dataTypeClass = Long::class, example = "1")
    ])
    @PutMapping(value = ["/{id}"], produces = ["application/json"])
    fun updateHost(@PathVariable id: Long, @RequestBody @Valid host: Host): ResponseEntity<DefaultResponse<Host>> {
        val updatedHost = hostService.updateHost(id, host)
        return ResponseEntity.status(HttpStatus.OK)
            .body(DefaultResponse(ResponseType.SUCCESS, "Host updated", updatedHost))
    }
}