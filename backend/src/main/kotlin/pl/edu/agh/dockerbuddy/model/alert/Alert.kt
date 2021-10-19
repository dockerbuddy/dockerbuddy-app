package pl.edu.agh.dockerbuddy.model.alert

data class Alert (val hostId: Long, val alertType: AlertType, val alertMessage: String)