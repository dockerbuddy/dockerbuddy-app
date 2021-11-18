import { Grid, Typography } from "@material-ui/core";
import React from "react";
import { Host } from "../../../common/types";
import AlertsDashboard from "../../AlertsDashboard/AlertsDashboard";
import StatPanel from "./StatPanel";

interface HostInfoProps {
  hostData: Host;
}

const HostInfo: React.FC<HostInfoProps> = ({ hostData }) => {
  return (
    <Grid container direction="column" style={{ padding: "15px" }} spacing={4}>
      <Grid
        container
        item
        direction="row"
        justify="space-between"
        alignItems="stretch"
        spacing={5}
      >
        <Grid item xs={6}>
          <StatPanel hostData={hostData} />
        </Grid>
        <Grid item container xs={6} direction="column" spacing={2}>
          <Grid item>
            <Typography variant="h5">Recent alerts</Typography>
          </Grid>
          <Grid item>
            <AlertsDashboard hostId={hostData.id} onlyList={true} />
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Typography variant="h5">Containers</Typography>
      </Grid>
    </Grid>
  );
};

export default HostInfo;
