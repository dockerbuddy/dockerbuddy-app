import React from "react";
import {
  makeStyles,
  Card,
  CardHeader,
  CardContent,
  Typography,
  IconButton,
  Grid,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import SettingsIcon from "@material-ui/icons/Settings";
import { humanFileSize } from "../../util/util";
import ProgressBarComponent from "./ProgressBarComponent";
import ContainerCardComponent from "./ContainerCardComponent";
import { ContainerSummary, FullHostSummary } from "../../common/types";

const useStyles = makeStyles((theme) => ({
  card: {
    borderColor: "#1A1C19",
    backgroundColor: "#1D1F22",
  },
  settingsColor: {
    color: theme.palette.primary.main,
  },
  nameColor: {
    color: "rgba(229, 209, 208,1)",
  },
}));

const HostCardComponent: React.FC<{ host: FullHostSummary }> = (props) => {
  const classes = useStyles();
  const host = props.host;
  const hostSummary = props.host.hostSummary;

  return (
    <Card className={classes.card} variant="outlined">
      <CardHeader
        title={
          <>
            <Typography
              variant="h6"
              style={{ display: "inline-block" }}
              className={classes.nameColor}
            >
              {host.hostName}
            </Typography>
            <Typography variant="h6" style={{ display: "inline-block" }}>
              {": " + host.ip}
            </Typography>
          </>
        }
        action={
          <IconButton aria-label="settings" className={classes.settingsColor}>
            <SettingsIcon />
          </IconButton>
        }
      />
      <CardContent>
        {hostSummary?.diskUsage !== undefined ? (
          <ProgressBarComponent
            name="Disk"
            used={humanFileSize(hostSummary.diskUsage.value)}
            total={humanFileSize(hostSummary.diskUsage.total)}
            percent={hostSummary.diskUsage.percent}
          />
        ) : (
          <Grid item>
            <Alert severity="error"> NO DISC INFO </Alert>
          </Grid>
        )}
        {hostSummary?.memoryUsage !== undefined ? (
          <ProgressBarComponent
            name="Vmem"
            used={humanFileSize(hostSummary.memoryUsage.value)}
            total={humanFileSize(hostSummary.memoryUsage.total)}
            percent={hostSummary.memoryUsage.percent}
          />
        ) : (
          <Grid item>
            <Alert severity="error"> NO VMEM INFO </Alert>
          </Grid>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" style={{ display: "inline-block" }}>
              Containers:
            </Typography>
          </Grid>
          {host.hostSummary?.containers !== undefined ? (
            host.hostSummary.containers.map((cont: ContainerSummary) => {
              return (
                <Grid item xs={4} key={cont.id}>
                  <ContainerCardComponent container={cont} />
                </Grid>
              );
            })
          ) : (
            <Grid item>
              <Alert severity="error"> NO CONTAINERS INFO </Alert>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default HostCardComponent;
