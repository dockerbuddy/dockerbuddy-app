import React from "react";
import {
  makeStyles,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { extractMetricPercent, extractMetricBasic } from "../../util/util";
import ProgressBarComponent from "./ProgressBarComponent";
import ContainerCardComponent from "./ContainerCardComponent";
import { Container, Host } from "../../common/types";
import { Link } from "react-router-dom";
import { MetricType } from "../../common/enums";
import NetworkInfo from "./NetworkInfo";

const useStyles = makeStyles((theme) => ({
  // card: {
  //   borderColor: "#1A1C19",
  //   backgroundColor: "#1D1F22",
  // },
  settingsColor: {
    color: theme.palette.primary.main,
  },
  nameColor: {
    color: "rgba(229, 209, 208, 1)",
  },
}));

const HostCardComponent: React.FC<{ host: Host }> = (props) => {
  const classes = useStyles();
  const host = props.host;
  const hostSummary = props.host.hostSummary;

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
    <Card variant="outlined">
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
      />
      <Link
        to={{ pathname: `/host/${host.id}`, state: { id: host.id } }}
        style={{ color: "inherit", textDecoration: "none" }}
      >
        <CardContent>
          <ProgressBarComponent name="Disk" metric={diskUsage} />
          <ProgressBarComponent name="Memory" metric={memoryUsage} />
          <ProgressBarComponent name="CPU" metric={cpuUsage} />
          <NetworkInfo networkIn={networkIn} networkOut={networkOut} />
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" style={{ display: "inline-block" }}>
                Containers:
              </Typography>
            </Grid>
            {host.hostSummary?.containers !== undefined ? (
              host.hostSummary.containers.map((cont: Container) => {
                return (
                  <Grid item xs={4} key={cont.id}>
                    <ContainerCardComponent container={cont} hostId={host.id} />
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
      </Link>
    </Card>
  );
};

export default HostCardComponent;
