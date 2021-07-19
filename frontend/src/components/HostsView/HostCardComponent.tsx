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
import { humanFileSize, getLatestStats } from "../../util/util";
import ProgressBarComponent from "./ProgressBarComponent";
import ContainerCardComponent from "./ContainerCardComponent";

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

//TODO: Create custom alert
const HostCardComponent: React.FC<{ host: HostData }> = (props) => {
  const classes = useStyles();
  const host = props.host;

  const diskData = getLatestStats(host.disk);
  const diskMax = humanFileSize(diskData.total);
  const diskUsed = humanFileSize(diskData.used);
  const diskPercent: number = diskData.percent;

  const vmem = getLatestStats(host.virtual_memory);

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
              {host.name}
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
        {host.disk !== undefined ? (
          <ProgressBarComponent
            name="Disk"
            used={diskUsed}
            total={diskMax}
            percent={diskPercent}
          />
        ) : (
          <Grid item>
            <Alert severity="error"> NO DISC INFO </Alert>
          </Grid>
        )}
        {host.virtual_memory !== undefined ? (
          <ProgressBarComponent
            name="Vmem"
            used={humanFileSize(vmem.used)}
            total={humanFileSize(vmem.total)}
            percent={vmem.percent}
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
          {host.containers !== undefined ? (
            host.containers.map((cont: Container) => {
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
