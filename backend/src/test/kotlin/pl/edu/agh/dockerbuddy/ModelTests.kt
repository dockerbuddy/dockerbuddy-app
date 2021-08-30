package pl.edu.agh.dockerbuddy

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import pl.edu.agh.dockerbuddy.model.AbstractRule
import pl.edu.agh.dockerbuddy.model.BaseLongIdEntity
import pl.edu.agh.dockerbuddy.model.Host
import pl.edu.agh.dockerbuddy.model.RuleType
import pl.edu.agh.dockerbuddy.repository.AbstractRuleRepository
import pl.edu.agh.dockerbuddy.repository.HostRepository
import javax.validation.Validation
import javax.validation.Validator
import kotlin.IllegalArgumentException

@DataJpaTest
@AutoConfigureTestDatabase
class ModelTests (
    @Autowired val hostRepository: HostRepository,
    @Autowired val abstractRuleRepository: AbstractRuleRepository
) {

    lateinit var validator: Validator

    @BeforeEach
    fun setUp() {
        val factory = Validation.buildDefaultValidatorFactory()
        validator = factory.validator
    }

    @Test
    fun baseLongIdEntityCreationTest() {
        val baseEntity = BaseLongIdEntity()
        assertTrue(baseEntity.isNew())
        assertNull(baseEntity.id)
    }

    @Test
    fun hostNameTest() {
        val host = Host("")
        val violations = validator.validate(host)
        assertFalse(violations.isEmpty())
    }

    @Test
    fun abstractRuleAlertLevelTest() {
        val host = Host("host")
        assertThrows(IllegalArgumentException().javaClass, fun() {
            AbstractRule(RuleType.DiskMem, 50, 10, host)
        })
    }

    @Test
    fun abstractRuleMinAlertLevelConstraintTest() {
        val host = Host("host")

        val abstractRule1 = AbstractRule(RuleType.DiskMem, -1, 20, host)
        var violations = validator.validate(abstractRule1)
        assertFalse(violations.isEmpty())

        val abstractRule2 = AbstractRule(RuleType.DiskMem, -2, -1, host)
        violations = validator.validate(abstractRule2)
        assertFalse(violations.isEmpty())
    }

    @Test
    fun abstractRuleMaxAlertLevelConstraintTest() {
        val host = Host("host")

        val abstractRule1 = AbstractRule(RuleType.DiskMem, 50, 105, host)
        var violations = validator.validate(abstractRule1)
        assertFalse(violations.isEmpty())

        val abstractRule2 = AbstractRule(RuleType.DiskMem, 105, 150, host)
        violations = validator.validate(abstractRule2)
        assertFalse(violations.isEmpty())
    }

    @Test
    fun saveHostToDBTest() {
        val host = Host("host")
        hostRepository.save(host)
        assertEquals(host, hostRepository.findAll().first())
    }

    @Test
    fun saveAbstractRuleToDBTest() {
        val host = Host("host")
        val abstractRule = AbstractRule(RuleType.DiskMem, 50, 90, host)
        host.rules.add(abstractRule) // crucial to have bidirectional relation!
        hostRepository.save(host) // AbstractRule is persisted when updated host is saved to DB
        assertEquals(abstractRule, abstractRuleRepository.findAll().first())
        assertEquals(abstractRule, hostRepository.findAll().first().rules.first())
    }
}