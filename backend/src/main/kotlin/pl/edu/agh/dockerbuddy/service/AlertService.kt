package pl.edu.agh.dockerbuddy.service

import io.reactivex.internal.util.ExceptionHelper
import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service
import pl.edu.agh.dockerbuddy.model.metric.HostSummary

@Service
class AlertService(val template: SimpMessagingTemplate) {
    private val logger = LoggerFactory.getLogger(ExceptionHelper::class.java)

    fun sendMessage(hostSummary: HostSummary){
        logger.info("Alert detected. Sending message...")
        template.convertAndSend("/alert", hostSummary)
    }
}