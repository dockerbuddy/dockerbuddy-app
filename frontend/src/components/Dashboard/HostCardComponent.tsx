import React from "react";
import {
  makeStyles,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  CardActions,
  Button,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import {
  extractMetricPercent,
  extractMetricBasic,
  extractHostRule,
} from "../../util/util";
import ProgressBarComponent from "./ProgressBarComponent";
import { Host } from "../../common/types";
import { Link } from "react-router-dom";
import { MetricType, RuleType } from "../../common/enums";
import NetworkInfo from "./NetworkInfo";
import AggregatedContainersComponent from "./AggregatedContainersComponent";
import NoMetricsComponent from "./NoMetricsComponent";

const useStyles = makeStyles((theme) => ({
  inactiveHost: {
    filter: "brightness(15%)",
  },
  settingsColor: {
    color: theme.palette.primary.main,
  },
  nameColor: {
    color: "rgba(229, 209, 208, 1)",
  },
}));

const HostCardComponent: React.FC<{ host: Host }> = ({ host }) => {
  const classes = useStyles();
  const hostSummary = host.hostSummary;

  const diskUsage = extractMetricPercent(
    hostSummary?.percentMetrics,
    MetricType.DISK_USAGE
  );
  const diskRule = extractHostRule(host.hostPercentRules, RuleType.DISK_USAGE);

  const memoryUsage = extractMetricPercent(
    hostSummary?.percentMetrics,
    MetricType.MEMORY_USAGE
  );
  const memRule = extractHostRule(host.hostPercentRules, RuleType.MEMORY_USAGE);

  const cpuUsage = extractMetricPercent(
    hostSummary?.percentMetrics,
    MetricType.CPU_USAGE
  );
  const cpuRule = extractHostRule(host.hostPercentRules, RuleType.CPU_USAGE);

  const networkOut = extractMetricBasic(
    hostSummary?.basicMetrics,
    MetricType.NETWORK_OUT
  );

  const networkIn = extractMetricBasic(
    hostSummary?.basicMetrics,
    MetricType.NETWORK_IN
  );

  const creationDate = new Date(host.creationDate);
  const timestamp = new Date(hostSummary?.timestamp);

  return (
    <div style={{ position: "relative" }}>
      <Card style={{ padding: "15px" }} variant="outlined">
        <CardHeader
          title={
            <>
              <Typography variant="h4" className={classes.nameColor}>
                {host.hostName}
              </Typography>
              <Typography variant="h6">IP Address: {host.ip}</Typography>
            </>
          }
          action={
            <>
              <Typography align="right" color="textSecondary">
                {`Created: ${creationDate.toLocaleTimeString()}, ${creationDate.toDateString()}`}
              </Typography>
              {hostSummary != undefined && (
                <Typography align="right" color="textSecondary">
                  {`Last update: ${timestamp.toLocaleTimeString()}, ${timestamp.toDateString()}`}
                </Typography>
              )}
            </>
          }
        />
        <CardContent
          style={{ backgroundColor: "#0F0910" }}
          className={host.isTimedOut ? classes.inactiveHost : ""}
        >
          {hostSummary != undefined ? (
            <>
              <Grid container direction="column" spacing={2}>
                <Grid item>
                  <Typography variant="h5" style={{ marginBottom: "-15px" }}>
                    Current status
                  </Typography>
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
                  <NetworkInfo networkIn={networkIn} networkOut={networkOut} />
                </Grid>
              </Grid>
              {host.hostSummary?.containers !== undefined ? (
                <AggregatedContainersComponent
                  containers={host.hostSummary.containers}
                />
              ) : (
                <Alert severity="error"> NO CONTAINERS INFO </Alert>
              )}
            </>
          ) : (
            <NoMetricsComponent hostId={host.id} />
          )}
        </CardContent>
        <CardActions>
          <Link
            to={{ pathname: `/host/${host.id}`, state: { id: host.id } }}
            style={{ color: "inherit", textDecoration: "none", width: "100%" }}
          >
            <Button variant="outlined" color="primary" fullWidth>
              <Typography variant="h6">Details</Typography>
            </Button>
          </Link>
        </CardActions>
      </Card>

      {host.isTimedOut && (
        <div
          style={{
            position: "absolute",
            top: "45%",
            width: "100%",
            backgroundColor: "transparent",
          }}
        >
          <Typography align="center" variant="h4">
            {`Host is offline`}
          </Typography>
          <Typography align="center" variant="h6" color="textSecondary">
            {hostSummary != undefined
              ? `Last response at ${timestamp.toLocaleTimeString()}, ${timestamp.toDateString()}`
              : "Last response unavaiable"}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default HostCardComponent;
