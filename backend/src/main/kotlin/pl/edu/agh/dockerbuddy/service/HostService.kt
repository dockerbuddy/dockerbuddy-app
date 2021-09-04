package pl.edu.agh.dockerbuddy.service

import org.springframework.stereotype.Service
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.repository.HostRepository

@Service
class HostService (
    private val hostRepository: HostRepository
){
    fun addHost(host: Host): Host {
        return hostRepository.save(host)
    }
}