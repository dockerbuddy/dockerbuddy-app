/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Grid } from "@mui/material";
import { makeStyles, Paper, Theme, Typography } from "@material-ui/core";
import React from "react";
import { AlertType, ReportStatus } from "../../common/enums";
import { Container } from "../../common/types";
import { alertColors } from "../../util/alertStyle";

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing(1),
    backgroundColor: "#19131A",
  },
  bold: {
    fontWeight: 550,
  },
  newColor: {
    color: "#3ed7c2",
  },
  disabled: {
    color: "#3d3d3d",
  },
  critical: {
    color: alertColors.red,
  },
}));

const AggregatedContainersComponent: React.FC<{ containers: Container[] }> = ({
  containers,
}) => {
  const classes = useStyles();

  const watchedContainers = containers.filter(
    //@ts-ignore
    (c) => ReportStatus[c.reportStatus] == ReportStatus.WATCHED
  );

  const watchedCriticalContainers = watchedContainers.filter(
    //@ts-ignore
    (c) => AlertType[c.alertType] == AlertType.CRITICAL
  );

  const newContainers = containers.filter(
    //@ts-ignore
    (c) => ReportStatus[c.reportStatus] == ReportStatus.NEW
  );

  return (
    <Grid container spacing={2} columns={7}>
      <Grid item xs={7} style={{ marginBottom: "-15px" }}>
        <Typography variant="h5">Containers</Typography>
      </Grid>
      <Grid item xs={3}>
        <Paper className={classes.container}>
          <Typography variant="h5" align="center">
            Watched containers
          </Typography>
          <Typography variant="h2" className={classes.bold} align="center">
            <g>{watchedContainers.length}</g>
            {/* {" "} */}
            <g className={classes.disabled}>/{containers.length}</g>
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={2}>
        <Paper className={classes.container}>
          <Typography variant="h5" align="center">
            Error containers
          </Typography>
          <Typography variant="h2" className={classes.bold} align="center">
            <g
              className={
                watchedCriticalContainers.length > 0
                  ? classes.critical
                  : classes.disabled
              }
            >
              {watchedCriticalContainers.length}
            </g>
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={2}>
        <Paper className={classes.container}>
          <Typography variant="h5" align="center">
            New containers
          </Typography>
          <Typography variant="h2" className={classes.bold} align="center">
            <g
              className={
                newContainers.length > 0 ? classes.newColor : classes.disabled
              }
            >
              {newContainers.length}
            </g>
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AggregatedContainersComponent;
