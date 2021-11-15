/* eslint-disable @typescript-eslint/no-unused-vars */
import { Grid } from "@material-ui/core";
import React from "react";
import { MetricType } from "../../../common/enums";
import { Host } from "../../../common/types";
import { extractMetric } from "../../../util/util";
import ProgressBarComponent from "../../Dashboard/ProgressBarComponent";

interface HostInfoProps {
  hostData: Host;
}

const HostInfo: React.FC<HostInfoProps> = ({ hostData }) => {
  //   const metric = extractMetric(
  //     hostData.hostSummary.metrics,
  //     MetricType.CPU_USAGE
  //   );

  //   console.log(metric);
  return (
    <Grid container>
      <Grid item>{hostData.hostSummary}</Grid>
      <Grid item>
        {/* <ProgressBarComponent
          name="CPU"
          metric={}
        /> */}
        asdasd
      </Grid>
      <Grid item>Sth else</Grid>
    </Grid>
  );
};

export default HostInfo;
