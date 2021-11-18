package pl.edu.agh.dockerbuddy.model.alert

data class AlertWithCounter (
    val alert: Alert,
    val alertsCounter: Int
)