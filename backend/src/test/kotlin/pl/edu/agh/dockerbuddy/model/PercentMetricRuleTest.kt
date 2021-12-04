package pl.edu.agh.dockerbuddy.model

import org.junit.jupiter.api.*
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource
import pl.edu.agh.dockerbuddy.model.entity.PercentMetricRule
import pl.edu.agh.dockerbuddy.model.enums.RuleType
import javax.validation.Validation
import javax.validation.Validator
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertFalse

class PercentMetricRuleTest {
    private lateinit var validator: Validator
    private val factory = Validation.buildDefaultValidatorFactory()

    @BeforeEach
    fun setUp() {
        validator = factory.validator
    }

    @Test
    fun warnLevel_GreaterThan_CriticalLevel_Test() {
        assertThrows(IllegalArgumentException::class.java, fun() {
            PercentMetricRule(RuleType.DISK_USAGE, 50, 10)
        })
    }

    @ParameterizedTest
    @EnumSource(value = RuleType::class, names = ["CPU_USAGE", "MEMORY_USAGE", "DISK_USAGE"])
    fun valid_RuleType_Test(ruleType: RuleType) {
        assertDoesNotThrow("Percent metric rule type must be one of the following: CPU_USAGE, " +
                "MEMORY_USAGE, DISK_USAGE") {
            PercentMetricRule(ruleType, 50, 80)
        }
    }

    @ParameterizedTest
    @EnumSource(value = RuleType::class, names = ["NETWORK_IN", "NETWORK_OUT"])
    fun invalid_RuleType_Test(ruleType: RuleType) {
        assertThrows(IllegalArgumentException::class.java, fun() {
            PercentMetricRule(ruleType, 50, 80)
        })
    }

    @Test
    fun alertLevel_BelowMin_Test() {
        val metricRule1 = PercentMetricRule(RuleType.DISK_USAGE, -1, 20)
        var violations = validator.validate(metricRule1)
        assertFalse(violations.isEmpty())

        val metricRule2 = PercentMetricRule(RuleType.DISK_USAGE, -2, -1)
        violations = validator.validate(metricRule2)
        assertFalse(violations.isEmpty())
    }

    @Test
    fun alertLevel_OverMax_Test() {
        val metricRule1 = PercentMetricRule(RuleType.DISK_USAGE, 50, 105)
        var violations = validator.validate(metricRule1)
        assertFalse(violations.isEmpty())

        val metricRule2 = PercentMetricRule(RuleType.DISK_USAGE, 105, 150)
        violations = validator.validate(metricRule2)
        assertFalse(violations.isEmpty())
    }
}