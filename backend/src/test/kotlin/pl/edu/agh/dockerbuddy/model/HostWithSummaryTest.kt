package pl.edu.agh.dockerbuddy.model

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.*
import javax.validation.Validation
import javax.validation.Validator

class HostWithSummaryTest {
    private lateinit var validator: Validator
    private val factory = Validation.buildDefaultValidatorFactory()

    @BeforeEach
    fun setUp() {
        validator = factory.validator
    }

    @ParameterizedTest
    @ValueSource(strings = ["192.168.1.1", "1.1.1.1", "255.255.255.255", "5.5.5.5"])
    fun valid_Test(ip: String) {
        val host = HostWithSummary(
            UUID.randomUUID(),
            "host",
            ip,
            LocalDateTime.now().toInstant(ZoneOffset.UTC).toString(),
            false,
            mutableListOf(),
            mutableListOf(),
            mutableListOf(),
            null
        )
        val violations = validator.validate(host)
        Assertions.assertTrue(violations.isEmpty())
    }

    @ParameterizedTest
    @ValueSource(strings = ["", "999.999.999.999", "256.1.0.0", "x.y.z.q", "ip"])
    fun invalidIp_Test(ip: String) {
        val host = HostWithSummary(
            UUID.randomUUID(),
            "host",
            ip,
            LocalDateTime.now().toInstant(ZoneOffset.UTC).toString(),
            false,
            mutableListOf(),
            mutableListOf(),
            mutableListOf(),
            null
        )
        val violations = validator.validate(host)
        Assertions.assertFalse(violations.isEmpty())
    }
}