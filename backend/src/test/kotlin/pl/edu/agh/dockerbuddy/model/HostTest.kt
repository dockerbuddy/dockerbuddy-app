package pl.edu.agh.dockerbuddy.model

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import org.mockito.Mockito
import pl.edu.agh.dockerbuddy.model.entity.Host
import pl.edu.agh.dockerbuddy.model.entity.PercentMetricRule
import javax.validation.Validation
import javax.validation.Validator

class HostTest {
    private lateinit var validator: Validator
    private val factory = Validation.buildDefaultValidatorFactory()

    @BeforeEach
    fun setUp() {
        validator = factory.validator
    }

    @Test
    fun `name shouldn't be blank`() {
        val host = Host("")
        val violations = validator.validate(host)
        Assertions.assertFalse(violations.isEmpty())
    }

    @ParameterizedTest
    @ValueSource(strings = ["192.168.1.1", "1.1.1.1", "255.255.255.255", "5.5.5.5"])
    fun `check valid ip input`(ip: String) {
        val host = Host("host", ip)
        val violations = validator.validate(host)
        Assertions.assertTrue(violations.isEmpty())
    }


    @ParameterizedTest
    @ValueSource(strings = ["", "999.999.999.999", "256.1.0.0", "x.y.z.q", "ip"])
    fun `check invalid ip input`(ip: String) {
        val host = Host("host", ip)
        val violations = validator.validate(host)
        Assertions.assertFalse(violations.isEmpty())
    }

    @Test
    fun `check initialization of collections in host`() {
        val host = Host("name", "192.168.1.1")
        Assertions.assertTrue(host.hostPercentRules.isEmpty())
        Assertions.assertTrue(host.hostBasicRules.isEmpty())
        Assertions.assertTrue(host.containers.isEmpty())
    }

    @Test
    fun `create host with some rule`() {
        val host = Host(
            "name",
            "192.168.1.1",
            mutableSetOf(Mockito.mock(PercentMetricRule::class.java)))
        Assertions.assertFalse(host.hostPercentRules.isEmpty())
    }
}