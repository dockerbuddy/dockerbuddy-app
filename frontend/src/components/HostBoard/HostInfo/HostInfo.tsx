import {
  Box,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@material-ui/core";
import { Search } from "@material-ui/icons";
import React, { useState } from "react";
import { Container, Host } from "../../../common/types";
import AlertsDashboard from "../../AlertsDashboard/AlertsDashboard";
import ContainerCardComponent from "../../Dashboard/ContainerCardComponent";
import StatPanel from "./StatPanel";

interface HostInfoProps {
  hostData: Host;
}

const HostInfo: React.FC<HostInfoProps> = ({ hostData }) => {
  const [filterName, setFilterName] = useState<string>("");

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
            <AlertsDashboard
              hostId={hostData?.id}
              onlyList={true}
              autoRefresh={true}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item container direction="column" spacing={4}>
        <Grid item>
          <Typography variant="h5">Containers</Typography>
          <Box mt={1}>
            <TextField
              id="filter-containers-textfield"
              label="Find container"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              variant="standard"
            />
          </Box>
        </Grid>
        <Grid container item spacing={2}>
          {hostData?.hostSummary?.containers
            .filter((cont: Container) =>
              cont.name.toLowerCase().includes(filterName.toLowerCase())
            )
            .map((cont: Container) => {
              return (
                <Grid item xs={2} key={cont.id}>
                  <ContainerCardComponent
                    container={cont}
                    hostId={hostData?.id}
                  />
                </Grid>
              );
            })}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default HostInfo;
