package pl.edu.agh.dockerbuddy.controller.response

data class DefaultResponse<T>(
        val type: ResponseType,
        val message: String,
        val body: T?
)
