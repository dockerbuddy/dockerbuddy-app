package pl.edu.agh.dockerbuddy.service

import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service
import pl.edu.agh.dockerbuddy.model.metric.HostSummary

@Service
class AlertService(val template: SimpMessagingTemplate) {
    fun sendMessage(hostSummary: HostSummary){
        template.convertAndSend("/alert", hostSummary)
    }
}