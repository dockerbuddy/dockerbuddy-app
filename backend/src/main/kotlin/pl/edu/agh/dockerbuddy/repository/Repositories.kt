package pl.edu.agh.dockerbuddy.repository

import org.springframework.data.jpa.repository.JpaRepository
import pl.edu.agh.dockerbuddy.model.entity.PercentMetricRule
import pl.edu.agh.dockerbuddy.model.entity.Host
import java.util.*

interface HostRepository: JpaRepository<Host, UUID>

interface AbstractRuleRepository: JpaRepository<PercentMetricRule, UUID>