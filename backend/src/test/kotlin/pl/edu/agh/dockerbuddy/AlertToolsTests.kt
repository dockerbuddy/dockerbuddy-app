package pl.edu.agh.dockerbuddy
//
//import org.junit.jupiter.api.Assertions
//import org.junit.jupiter.api.Test
//import pl.edu.agh.dockerbuddy.model.AlertType
//import pl.edu.agh.dockerbuddy.model.RuleType
//import pl.edu.agh.dockerbuddy.model.entity.MetricRule
//import pl.edu.agh.dockerbuddy.model.metric.BasicMetric
//import pl.edu.agh.dockerbuddy.tools.addAlertType
//import pl.edu.agh.dockerbuddy.tools.checkForAlert
//
//class AlertToolsTests {
//    @Test
//    fun applyAlertTypeTest1(){
//        //given
//        val basicMetric = BasicMetric(10.0, 100.0, 0.1, null, null)
//        val rule = MetricRule(RuleType.DiskUsage, 40, 60)
//
//        //when
//        addAlertType(basicMetric, rule)
//
//        //then
//        Assertions.assertEquals(AlertType.OK, basicMetric.alertType)
//    }
//
//    @Test
//    fun applyAlertTypeTest2(){
//        //given
//        val basicMetric = BasicMetric(10.0, 100.0, 0.5, null, null)
//        val rule = MetricRule(RuleType.DiskUsage, 40, 60)
//
//        //when
//        addAlertType(basicMetric, rule)
//
//        //then
//        Assertions.assertEquals(AlertType.WARN, basicMetric.alertType)
//    }
//
//    @Test
//    fun applyAlertTypeTest3(){
//        //given
//        val basicMetric = BasicMetric(10.0, 100.0, 0.8, null, null)
//        val rule = MetricRule(RuleType.DiskUsage, 40, 60)
//
//        //when
//        addAlertType(basicMetric, rule)
//
//        //then
//        Assertions.assertEquals(AlertType.CRITICAL, basicMetric.alertType)
//    }
//
//    @Test
//    fun applyAlertTypeTest4(){
//        //given
//        val basicMetric = BasicMetric(10.0, 100.0, 0.4, null, null)
//        val rule = MetricRule(RuleType.DiskUsage, 40, 60)
//
//        //when
//        addAlertType(basicMetric, rule)
//
//        //then
//        Assertions.assertEquals(AlertType.WARN, basicMetric.alertType)
//    }
//
//    @Test
//    fun applyAlertTypeTest5(){
//        //given
//        val basicMetric = BasicMetric(10.0, 100.0, 0.6, null, null)
//        val rule = MetricRule(RuleType.DiskUsage, 40, 60)
//
//        //when
//        addAlertType(basicMetric, rule)
//
//        //then
//        Assertions.assertEquals(AlertType.WARN, basicMetric.alertType)
//    }
//
//    @Test
//    fun checkForAlertTest1(){
//        //given
//        val prevBasicMetric = BasicMetric(10.0, 100.0, 0.55, AlertType.WARN, null)
//        val basicMetric = BasicMetric(10.0, 100.0, 0.6, AlertType.WARN, null)
//
//        //when
//        checkForAlert(basicMetric, prevBasicMetric)
//
//        //then
//        Assertions.assertEquals(false, basicMetric.alert)
//    }
//
//    @Test
//    fun checkForAlertTest2(){
//        //given
//        val prevBasicMetric = BasicMetric(10.0, 100.0, 0.1, AlertType.OK, null)
//        val basicMetric = BasicMetric(10.0, 100.0, 0.6, AlertType.WARN, null)
//
//        //when
//        checkForAlert(basicMetric, prevBasicMetric)
//
//        //then
//        Assertions.assertEquals(true, basicMetric.alert)
//    }
//
//    @Test
//    fun checkForAlertTest3(){
//        //given
//        val prevBasicMetric = BasicMetric(10.0, 100.0, 0.55, AlertType.WARN, null)
//        val basicMetric = BasicMetric(10.0, 100.0, 0.99, AlertType.CRITICAL, null)
//
//        //when
//        checkForAlert(basicMetric, prevBasicMetric)
//
//        //then
//        Assertions.assertEquals(true, basicMetric.alert)
//    }
//}