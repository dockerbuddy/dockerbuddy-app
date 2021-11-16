package pl.edu.agh.dockerbuddy.model

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import java.util.*
import javax.validation.Validation
import javax.validation.Validator

class HostSummaryTest {
    lateinit var validator: Validator

    @BeforeEach
    fun setUp() {
        val factory = Validation.buildDefaultValidatorFactory()
        validator = factory.validator
    }

    @ParameterizedTest
    @ValueSource(strings = ["1970-01-01T00:00:00Z", "2021-12-31T23:59:99Z", "2005-04-02T21:37:00Z"])
    fun hostSummaryTimestamp_Valid_Test(ip: String) {
        val host = HostSummary(UUID.randomUUID(), ip, mutableListOf(), mutableListOf())
        val violations = validator.validate(host)
        Assertions.assertTrue(violations.isEmpty())
    }

    @ParameterizedTest
    @ValueSource(strings = ["1970-01-01T00:00:00", "1970-01-01-00:00:00Z", "21970-01-01 00:00:00"])
    fun hostSummaryTimestamp_Invalid_Test(ip: String) {
        val host = HostWithSummary(UUID.randomUUID(), "host", ip, mutableListOf(), mutableListOf(), null)
        val violations = validator.validate(host)
        Assertions.assertFalse(violations.isEmpty())
    }
}