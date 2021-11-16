package pl.edu.agh.dockerbuddy.model

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import pl.edu.agh.dockerbuddy.model.entity.MetricRule
import pl.edu.agh.dockerbuddy.model.enums.RuleType
import javax.validation.Validation
import javax.validation.Validator

class MetricRuleTest {
    lateinit var validator: Validator

    @BeforeEach
    fun setUp() {
        val factory = Validation.buildDefaultValidatorFactory()
        validator = factory.validator
    }

    @Test
    fun metricRule_WarnLevel_GreaterThan_CriticalLevel_Test() {
        Assertions.assertThrows(IllegalArgumentException::class.java, fun() {
            MetricRule(RuleType.DISK_USAGE, 50, 10)
        })
    }

    @Test
    fun metricRule_AlertLevel_BelowMin_Test() {
        val metricRule1 = MetricRule(RuleType.DISK_USAGE, -1, 20)
        var violations = validator.validate(metricRule1)
        Assertions.assertFalse(violations.isEmpty())

        val metricRule2 = MetricRule(RuleType.DISK_USAGE, -2, -1)
        violations = validator.validate(metricRule2)
        Assertions.assertFalse(violations.isEmpty())
    }

    @Test
    fun metricRule_AlertLevel_OverMax_Test() {
        val metricRule1 = MetricRule(RuleType.DISK_USAGE, 50, 105)
        var violations = validator.validate(metricRule1)
        Assertions.assertFalse(violations.isEmpty())

        val metricRule2 = MetricRule(RuleType.DISK_USAGE, 105, 150)
        violations = validator.validate(metricRule2)
        Assertions.assertFalse(violations.isEmpty())
    }
}