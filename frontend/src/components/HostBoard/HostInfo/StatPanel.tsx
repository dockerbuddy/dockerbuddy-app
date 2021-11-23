import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { MetricType } from "../../../common/enums";
import { Host } from "../../../common/types";
import { extractMetricPercent } from "../../../util/util";
import ProgressBarComponent from "../../Dashboard/ProgressBarComponent";

interface StatPanelProps {
  hostData: Host;
}

const StatPanel: React.FC<StatPanelProps> = ({ hostData }) => {
  const metric = hostData?.hostSummary?.percentMetrics;
  const cpu_metric = extractMetricPercent(metric, MetricType.CPU_USAGE);
  const memory_metric = extractMetricPercent(metric, MetricType.MEMORY_USAGE);
  const disk_metric = extractMetricPercent(metric, MetricType.DISK_USAGE);

  return (
    <Grid container direction="column" spacing={2}>
      <Grid item>
        <Typography variant="h5">Current status</Typography>
      </Grid>
      <Grid item>
        <ProgressBarComponent name={"Disk"} metric={disk_metric} />
      </Grid>
      <Grid item>
        <ProgressBarComponent name={"Memory"} metric={memory_metric} />
      </Grid>
      <Grid item>
        <ProgressBarComponent name={"CPU"} metric={cpu_metric} />
      </Grid>
    </Grid>
  );
};

export default StatPanel;
