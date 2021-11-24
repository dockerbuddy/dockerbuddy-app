import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { MetricType } from "../../../common/enums";
import { Host } from "../../../common/types";
import { extractMetricBasic, extractMetricPercent } from "../../../util/util";
import NetworkInfo from "../../Dashboard/NetworkInfo";
import ProgressBarComponent from "../../Dashboard/ProgressBarComponent";

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

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h5">Current status</Typography>
      </Grid>
      <Grid item>
        <ProgressBarComponent name={"Disk"} metric={diskUsage} />
      </Grid>
      <Grid item>
        <ProgressBarComponent name={"Memory"} metric={memoryUsage} />
      </Grid>
      <Grid item>
        <ProgressBarComponent name={"CPU"} metric={cpuUsage} />
      </Grid>
      <Grid item>
        <NetworkInfo networkIn={networkIn} networkOut={networkOut} />
      </Grid>
    </Grid>
  );
};

export default StatPanel;
