package pl.edu.agh.dockerbuddy

import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.mockito.Mockito
import pl.edu.agh.dockerbuddy.inmemory.InMemory
import pl.edu.agh.dockerbuddy.inmemory.InMemoryStorage
import pl.edu.agh.dockerbuddy.model.metric.HostSummary
import java.util.*

class InMemoryStorageTest {
    @Test
    fun `save HostSummary 1`() {
        //given
        val inMemory: InMemory = InMemoryStorage()
        val id: UUID = UUID.randomUUID()
        val hostSummary: HostSummary = Mockito.mock(HostSummary::class.java)

        //when
        inMemory.saveHostSummary(id, hostSummary)

        //then
        Assertions.assertEquals(hostSummary, inMemory.getHostSummary(id))
    }

    @Test
    fun `save HostSummary 2`() {
        //given
        val inMemory: InMemory = InMemoryStorage()
        val id: UUID = UUID.randomUUID()
        val hostSummary: HostSummary = Mockito.mock(HostSummary::class.java)

        //when
        inMemory.saveHostSummary(id, hostSummary)

        //then
        Assertions.assertEquals(hostSummary, inMemory.getHostSummary(id))
    }

//    @Test
//    fun getAllHostSummariesTest1() {
//        //given
//        val inMemory: InMemory = InMemoryStorage()
//        val hostSummary1: HostSummary = Mockito.mock(HostSummary::class.java)
//        val hostSummary2: HostSummary = Mockito.mock(HostSummary::class.java)
//
//        //when
//        inMemory.saveHostSummary(1, hostSummary1)
//        inMemory.saveHostSummary(2, hostSummary2)
//
//        //then
//        Assertions.assertEquals(listOf(hostSummary1, hostSummary2), inMemory.getAllHostSummaries())
//    }

    @Test
    fun `get all HostSummaries 1`() {
        //given
        val inMemory: InMemory = InMemoryStorage()

        //then
        Assertions.assertEquals(emptyList<HostSummary>(), inMemory.getAllHostSummaries())
    }

    @Test
    fun `get all HostSummaries 2`() {
        //given
        val inMemory: InMemory = InMemoryStorage()
        val id: UUID = UUID.randomUUID()
        val hostSummary: HostSummary = Mockito.mock(HostSummary::class.java)

        //when
        inMemory.saveHostSummary(id, hostSummary)
        inMemory.deleteHost(id)

        //then
        Assertions.assertEquals(emptyList<HostSummary>(), inMemory.getAllHostSummaries())
    }

    @Test
    fun `delete HostSummary`() {
        //given
        val inMemory: InMemory = InMemoryStorage()
        val id: UUID = UUID.randomUUID()
        val hostSummary: HostSummary = Mockito.mock(HostSummary::class.java)

        //when
        inMemory.saveHostSummary(id, hostSummary)
        inMemory.deleteHost(id)

        //then
        Assertions.assertEquals(null, inMemory.getHostSummary(id))
    }
}