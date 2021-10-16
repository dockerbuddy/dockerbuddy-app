package pl.edu.agh.dockerbuddy.config

import org.springframework.context.annotation.Configuration
import org.springframework.web.socket.config.annotation.StompEndpointRegistry

import org.springframework.messaging.simp.config.MessageBrokerRegistry

import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer

import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker


@Configuration
@EnableWebSocketMessageBroker
class WebSocketConfig : WebSocketMessageBrokerConfigurer {
    override fun configureMessageBroker(config: MessageBrokerRegistry) {
        config.enableSimpleBroker("/alerts", "/metrics") // TODO change name and add new channels
    }

    override fun registerStompEndpoints(registry: StompEndpointRegistry) {
        registry.addEndpoint("/api/v2/ws")
                //TODO it should not stay this way on prod
                .setAllowedOriginPatterns("*")
                .withSockJS()
    }
}