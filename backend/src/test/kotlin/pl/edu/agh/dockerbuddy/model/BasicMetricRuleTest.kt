package pl.edu.agh.dockerbuddy.model

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertDoesNotThrow
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource
import pl.edu.agh.dockerbuddy.model.entity.BasicMetricRule
import pl.edu.agh.dockerbuddy.model.enums.RuleType
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
    fun warnLevel_GreaterThan_CriticalLevel_Test() {
        Assertions.assertThrows(IllegalArgumentException::class.java, fun() {
            BasicMetricRule(RuleType.NETWORK_IN, 500000000, 100000)
        })
    }

    @ParameterizedTest
    @EnumSource(value = RuleType::class, names = ["NETWORK_IN", "NETWORK_OUT"])
    fun valid_RuleType_Test(ruleType: RuleType) {
        assertDoesNotThrow("Percent metric rule type must be one of the following: CPU_USAGE, " +
                "MEMORY_USAGE, DISK_USAGE") {
            BasicMetricRule(ruleType, 50, 80)
        }
    }

    @ParameterizedTest
    @EnumSource(value = RuleType::class, names = ["CPU_USAGE", "MEMORY_USAGE", "DISK_USAGE"])
    fun invalid_RuleType_Test(ruleType: RuleType) {
        Assertions.assertThrows(IllegalArgumentException::class.java, fun() {
            BasicMetricRule(ruleType, 50, 80)
        })
    }

    @Test
    fun alertLevel_BelowMin_Test() {
        val metricRule1 = BasicMetricRule(RuleType.NETWORK_IN, -1, 20)
        var violations = validator.validate(metricRule1)
        Assertions.assertFalse(violations.isEmpty())

        val metricRule2 = BasicMetricRule(RuleType.NETWORK_IN, -2, -1)
        violations = validator.validate(metricRule2)
        Assertions.assertFalse(violations.isEmpty())
    }
}