package pl.edu.agh.dockerbuddy.controller.exceptionhandler

import io.reactivex.internal.util.ExceptionHelper
import org.slf4j.LoggerFactory
import org.springframework.core.annotation.Order
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import pl.edu.agh.dockerbuddy.controller.response.DefaultResponse
import pl.edu.agh.dockerbuddy.controller.response.ResponseType
import javax.persistence.EntityNotFoundException
import javax.validation.ConstraintViolationException

@ControllerAdvice
class ExceptionHandler {
    private val logger = LoggerFactory.getLogger(ExceptionHelper::class.java)

    @Order(1)
    @ExceptionHandler(value = [ EntityNotFoundException::class ])
    fun handleEntityNotFound(ex: EntityNotFoundException): ResponseEntity<DefaultResponse> {
        logger.error("EntityNotFoundException: " + ex.message)
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(DefaultResponse(ResponseType.ERROR, ex.message ?: "No message provided", null))
    }

    @Order(1)
    @ExceptionHandler(value = [ IllegalArgumentException::class ])
    fun handleIllegalArgumentException(ex: IllegalArgumentException):ResponseEntity<DefaultResponse> {
        logger.error("IllegalArgumentException: " + ex.message)
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(DefaultResponse(ResponseType.ERROR, ex.message ?: "No message provided", null))
    }

    @Order(1)
    @ExceptionHandler(value = [ ConstraintViolationException::class, org.hibernate.exception.ConstraintViolationException::class ])
    fun handleIllegalArgumentException(ex: Exception):ResponseEntity<DefaultResponse> {
        logger.error("ConstraintViolationException: " + ex.message)
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(DefaultResponse(ResponseType.ERROR, ex.message ?: "No message provided", null))
    }

    @Order
    @ExceptionHandler(value = [ Exception::class ])
    fun handleOtherException(ex: Exception): ResponseEntity<DefaultResponse> {
        logger.error("An unhandled exception occurred: " + ex.message)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(DefaultResponse(ResponseType.ERROR, ex.message ?: "No message provided", null))
    }
}