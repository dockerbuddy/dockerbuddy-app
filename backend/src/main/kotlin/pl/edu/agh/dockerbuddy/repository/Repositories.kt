package pl.edu.agh.dockerbuddy.repository

import org.springframework.data.jpa.repository.JpaRepository
import pl.edu.agh.dockerbuddy.model.entity.MetricRule
import pl.edu.agh.dockerbuddy.model.entity.Host

interface HostRepository: JpaRepository<Host, Long>

interface AbstractRuleRepository: JpaRepository<MetricRule, Long>