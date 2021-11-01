package pl.edu.agh.dockerbuddy.model.enums

enum class ContainerState {
    CREATED,
    RESTARTING,
    REMOVING,
    RUNNING,
    PAUSED,
    EXITED,
    DEAD;

    fun humaneReadable(): String {
        return name.lowercase()
    }
}
