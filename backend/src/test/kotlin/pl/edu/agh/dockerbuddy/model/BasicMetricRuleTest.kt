package pl.edu.agh.dockerbuddy.model

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource
import pl.edu.agh.dockerbuddy.model.entity.BasicMetricRule
import pl.edu.agh.dockerbuddy.model.enums.BasicMetricType
import javax.validation.Validation
import javax.validation.Validator

class BasicMetricRuleTest {
    private lateinit var validator: Validator
    private val factory = Validation.buildDefaultValidatorFactory()

    @BeforeEach
    fun setUp() {
        validator = factory.validator
    }

    @Test
    fun `warnLevel shouldn't be greater than criticalLevel`() {
        Assertions.assertThrows(IllegalArgumentException::class.java, fun() {
            BasicMetricRule(BasicMetricType.NETWORK_IN, 500000000, 100000)
        })
    }

    @ParameterizedTest
    @EnumSource(value = BasicMetricType::class, names = ["NETWORK_IN", "NETWORK_OUT"])
    fun `check valid RuleType inputs`(ruleType: BasicMetricType) {
        assertDoesNotThrow("Percent metric rule type must be one of the following: CPU_USAGE, " +
                "MEMORY_USAGE, DISK_USAGE") {
            BasicMetricRule(ruleType, 50, 80)
        }
    }

    @Test
    fun `check invalid RuleType inputs`() {
        val metricRule1 = BasicMetricRule(BasicMetricType.NETWORK_IN, -1, 20)
        var violations = validator.validate(metricRule1)
        Assertions.assertFalse(violations.isEmpty())

        val metricRule2 = BasicMetricRule(BasicMetricType.NETWORK_IN, -2, -1)
        violations = validator.validate(metricRule2)
        Assertions.assertFalse(violations.isEmpty())
    }
}