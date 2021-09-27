package pl.edu.agh.dockerbuddy.controller.exceptionhandler

import org.slf4j.LoggerFactory
import org.springframework.core.Ordered
import org.springframework.core.annotation.Order
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import pl.edu.agh.dockerbuddy.controller.response.DefaultResponse
import pl.edu.agh.dockerbuddy.controller.response.ResponseType
import javax.persistence.EntityNotFoundException
import javax.validation.ConstraintViolationException


@ControllerAdvice
class ExceptionHandler {
    private val logger = LoggerFactory.getLogger(pl.edu.agh.dockerbuddy.controller.exceptionhandler.ExceptionHandler::class.java)

    @ExceptionHandler(value = [ EntityNotFoundException::class ])
    fun handleEntityNotFound(ex: EntityNotFoundException): ResponseEntity<DefaultResponse> {
        logger.warn(ex.message)
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(DefaultResponse(ResponseType.ERROR, ex.message ?: "No message provided", null))
    }

    @ExceptionHandler(value = [ IllegalArgumentException::class ])
    fun handleIllegalArgumentException(ex: IllegalArgumentException):ResponseEntity<DefaultResponse> {
        logger.error("IllegalArgumentException: " + ex.message)
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(DefaultResponse(ResponseType.ERROR, ex.message ?: "No message provided", null))
    }

    @ExceptionHandler(value = [ ConstraintViolationException::class, org.hibernate.exception.ConstraintViolationException::class ])
    fun handleIllegalArgumentException(ex: Exception):ResponseEntity<DefaultResponse> {
        logger.error("ConstraintViolationException: " + ex.message)
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(DefaultResponse(ResponseType.ERROR, ex.message ?: "No message provided", null))
    }

    @ExceptionHandler(value = [MethodArgumentNotValidException::class])
    fun handleValidationExceptions(ex: MethodArgumentNotValidException):ResponseEntity<DefaultResponse> {
        val errors: MutableMap<String, String> = HashMap()
        ex.bindingResult.allErrors.forEach { error ->
            val fieldName = (error as FieldError).field
            val errorMessage: String? = error.getDefaultMessage()
            errors[fieldName] = errorMessage.toString()
        }
        logger.error("MethodArgumentNotValidException: $errors")
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(DefaultResponse(ResponseType.ERROR, "Validation failed for some arguments", errors))
    }

    @Order(Ordered.LOWEST_PRECEDENCE)
    @ExceptionHandler(value = [ Exception::class ])
    fun handleOtherException(ex: Exception): ResponseEntity<DefaultResponse> {
        logger.error("An unhandled exception occurred: " + ex.message)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(DefaultResponse(ResponseType.ERROR, ex.message ?: "No message provided", null))
    }
}