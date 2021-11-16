package pl.edu.agh.dockerbuddy.model

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import org.mockito.Mockito
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.model.entity.MetricRule
import javax.validation.Validation
import javax.validation.Validator

class HostTest {
    lateinit var validator: Validator

    @BeforeEach
    fun setUp() {
        val factory = Validation.buildDefaultValidatorFactory()
        validator = factory.validator
    }

    @Test
    fun hostName_NotBlank_Test() {
        val host = Host("")
        val violations = validator.validate(host)
        Assertions.assertFalse(violations.isEmpty())
    }

    @ParameterizedTest
    @ValueSource(strings = ["192.168.1.1", "1.1.1.1", "255.255.255.255", "5.5.5.5"])
    fun hostIP_Valid_Test(ip: String) {
        val host = Host("host", ip)
        val violations = validator.validate(host)
        Assertions.assertTrue(violations.isEmpty())
    }


    @ParameterizedTest
    @ValueSource(strings = ["", "999.999.999.999", "256.1.0.0", "x.y.z.q", "ip"])
    fun hostIP_Invalid_Test(ip: String) {
        val host = Host("host", ip)
        val violations = validator.validate(host)
        Assertions.assertFalse(violations.isEmpty())
    }

    @Test
    fun hostRules_Init_Test() {
        val host = Host("name", "192.168.1.1")
        Assertions.assertTrue(host.hostRules.isEmpty())
    }

    @Test
    fun createHost_WithRule_Test() {
        val host = Host(
            "name",
            "192.168.1.1",
            mutableSetOf(Mockito.mock(MetricRule::class.java)))
        Assertions.assertFalse(host.hostRules.isEmpty())
    }
}