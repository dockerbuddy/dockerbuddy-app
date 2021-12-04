package pl.edu.agh.dockerbuddy.model

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import java.time.LocalDateTime
import java.time.ZoneOffset
import java.util.*
import javax.validation.Validation
import javax.validation.Validator

class HostSummaryTest {
    private lateinit var validator: Validator
    private val factory = Validation.buildDefaultValidatorFactory()

    @BeforeEach
    fun setUp() {
        validator = factory.validator
    }

    @ParameterizedTest
    @ValueSource(strings = ["1970-01-01T00:00:00Z", "2021-12-31T23:59:99Z", "2005-04-02T21:37:00Z"])
    fun validTimestamp_Test(ip: String) {
        val host = HostSummary(UUID.randomUUID(), ip, 60, emptyList(), emptyList(), emptyList())
        val violations = validator.validate(host)
        Assertions.assertTrue(violations.isEmpty())
    }

    @ParameterizedTest
    @ValueSource(strings = ["1970-01-01T00:00:00", "1970-01-01-00:00:00Z", "21970-01-01 00:00:00"])
    fun invalidTimestamp_Test(ip: String) {
        val host = HostWithSummary(
            UUID.randomUUID(),
            "host",
            ip,
            LocalDateTime.now().toInstant(ZoneOffset.UTC),
            false,
            emptyList(),
            emptyList(),
            emptyList(),
            null
        )
        val violations = validator.validate(host)
        Assertions.assertFalse(violations.isEmpty())
    }
}