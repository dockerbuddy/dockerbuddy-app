import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { MetricType, RuleType } from "../../../common/enums";
import { Host } from "../../../common/types";
import {
  extractHostRule,
  extractMetricBasic,
  extractMetricPercent,
} from "../../../common/util";
import NetworkInfo from "../../Dashboard/HostComponents/NetworkInfo";
import ProgressBarComponent from "../../Dashboard/HostComponents/ProgressBarComponent";

interface StatPanelProps {
  hostData: Host;
}

const StatPanel: React.FC<StatPanelProps> = ({ hostData }) => {
  const hostSummary = hostData?.hostSummary;

  const diskUsage = extractMetricPercent(
    hostSummary?.percentMetrics,
    MetricType.DISK_USAGE
  );
  const memoryUsage = extractMetricPercent(
    hostSummary?.percentMetrics,
    MetricType.MEMORY_USAGE
  );
  const cpuUsage = extractMetricPercent(
    hostSummary?.percentMetrics,
    MetricType.CPU_USAGE
  );

  const networkOut = extractMetricBasic(
    hostSummary?.basicMetrics,
    MetricType.NETWORK_OUT
  );

  const networkIn = extractMetricBasic(
    hostSummary?.basicMetrics,
    MetricType.NETWORK_IN
  );

  const diskRule = extractHostRule(
    hostData.hostPercentRules,
    RuleType.DISK_USAGE
  );
  const memRule = extractHostRule(
    hostData.hostPercentRules,
    RuleType.MEMORY_USAGE
  );
  const cpuRule = extractHostRule(
    hostData.hostPercentRules,
    RuleType.CPU_USAGE
  );

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h5">Current status</Typography>
      </Grid>
      <Grid item>
        <ProgressBarComponent
          name={"Disk"}
          metric={diskUsage}
          metricRule={diskRule}
        />
      </Grid>
      <Grid item>
        <ProgressBarComponent
          name={"Memory"}
          metric={memoryUsage}
          metricRule={memRule}
        />
      </Grid>
      <Grid item>
        <ProgressBarComponent
          name={"CPU"}
          metric={cpuUsage}
          metricRule={cpuRule}
        />
      </Grid>
      <Grid item>
        <NetworkInfo
          networkIn={networkIn}
          networkOut={networkOut}
          rules={hostData.hostBasicRules}
        />
      </Grid>
    </Grid>
  );
};

export default StatPanel;
