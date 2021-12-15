package pl.edu.agh.dockerbuddy.model

import org.junit.jupiter.api.*
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.EnumSource
import pl.edu.agh.dockerbuddy.model.entity.PercentMetricRule
import javax.validation.Validation
import javax.validation.Validator
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Assertions.assertFalse
import pl.edu.agh.dockerbuddy.model.enums.PercentMetricType

class PercentMetricRuleTest {
    private lateinit var validator: Validator
    private val factory = Validation.buildDefaultValidatorFactory()

    @BeforeEach
    fun setUp() {
        validator = factory.validator
    }

    @Test
    fun `warnLevel can't be greater than criticalLevel`() {
        assertThrows(IllegalArgumentException::class.java, fun() {
            PercentMetricRule(PercentMetricType.DISK_USAGE, 50, 10)
        })
    }

    @ParameterizedTest
    @EnumSource(value = PercentMetricType::class, names = ["CPU_USAGE", "MEMORY_USAGE", "DISK_USAGE"])
    fun `check invalid ruleType input`(ruleType: PercentMetricType) {
        assertDoesNotThrow("Percent metric rule type must be one of the following: CPU_USAGE, " +
                "MEMORY_USAGE, DISK_USAGE") {
            PercentMetricRule(ruleType, 50, 80)
        }
    }

    @Test
    fun `alertLevel can't be below minimum value`() {
        val metricRule1 = PercentMetricRule(PercentMetricType.DISK_USAGE, -1, 20)
        var violations = validator.validate(metricRule1)
        assertFalse(violations.isEmpty())

        val metricRule2 = PercentMetricRule(PercentMetricType.DISK_USAGE, -2, -1)
        violations = validator.validate(metricRule2)
        assertFalse(violations.isEmpty())
    }

    @Test
    fun `alertLevel can't be greater than max value`() {
        val metricRule1 = PercentMetricRule(PercentMetricType.DISK_USAGE, 50, 105)
        var violations = validator.validate(metricRule1)
        assertFalse(violations.isEmpty())

        val metricRule2 = PercentMetricRule(PercentMetricType.DISK_USAGE, 105, 150)
        violations = validator.validate(metricRule2)
        assertFalse(violations.isEmpty())
    }
}