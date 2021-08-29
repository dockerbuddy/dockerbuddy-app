package pl.edu.agh.dockerbuddy.repository

import org.springframework.data.jpa.repository.JpaRepository
import pl.edu.agh.dockerbuddy.model.AbstractRule
import pl.edu.agh.dockerbuddy.model.Host

interface HostRepository: JpaRepository<Host, Long>

interface AbstractRuleRepository: JpaRepository<AbstractRule, Long>