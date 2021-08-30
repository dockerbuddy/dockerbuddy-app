package pl.edu.agh.dockerbuddy.controller.response

data class DefaultResponse(
        val type: ResponseType,
        val message: String,
        val body: Any?
)
