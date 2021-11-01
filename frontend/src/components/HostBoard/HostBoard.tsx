/* eslint-disable */
import {
  ButtonBase,
  Card,
  CardContent,
  Grid,
  IconButton,
  makeStyles,
  Typography,
} from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import { Alert } from "@material-ui/lab";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { selectHost } from "../../redux/hostsSlice";
import { useAppSelector } from "../../redux/hooks";
import HostMenu from "./HostMenu";
import InfluxHistory from "./InfluxHistory/InfluxHistory";
import MetricPieChart from "./MetricPieChart";
import { extractHostRule, extractMetric } from "../../util/util";
import { MetricType, RuleType } from "../../common/enums";

const useStyles = makeStyles((theme) => ({
  pieChartButton: {
    paddingTop: "40px",
  },
  inactiveColor: {
    backgroundColor: "#111111",
  },
  activeColor: {
    backgroundColor: "#222222",
  },
  shortenTopMargin: {
    marginTop: "-12px",
  },
}));

type HParam = { id: string };

const HostBoard: React.FC<RouteComponentProps<HParam>> = ({ match }) => {
  const classes = useStyles();
  const hostId = parseInt(match.params.id);
  const hostData = useAppSelector(selectHost).hosts[hostId];
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const summary = hostData?.hostSummary;
  const mem = extractMetric(summary?.metrics, MetricType.MEMORY_USAGE);
  const memRule = extractHostRule(hostData?.hostRules, RuleType.MEMORY_USAGE);
  const cpu = extractMetric(summary?.metrics, MetricType.CPU_USAGE);
  const cpuRule = extractHostRule(hostData?.hostRules, RuleType.CPU_USAGE);
  const disk = extractMetric(summary?.metrics, MetricType.DISK_USAGE);
  const diskRule = extractHostRule(hostData?.hostRules, RuleType.DISK_USAGE);

  const [activeMetric, setActiveMetric] = React.useState<string>(
    MetricType.CPU_USAGE
  );

  return (
    <>
      {hostData !== undefined ? (
        <Card>
          <CardContent>
            <Grid container direction="column" spacing={3}>
              <Grid item container direction="column" spacing={1}>
                <Grid item container justify="space-between">
                  <Grid item>
                    <Typography
                      variant="h4"
                      style={{ display: "inline-block" }}
                    >
                      {hostData.hostName}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <IconButton aria-label="settings" onClick={handleClick}>
                      <SettingsIcon color="primary" />
                    </IconButton>
                  </Grid>
                </Grid>
                <Grid item>
                  <Typography variant="subtitle1">ID: {hostData.id}</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="subtitle1">
                    IP Address: {hostData.ip}
                  </Typography>
                </Grid>
              </Grid>
              <Grid item container spacing={5}>
                <Grid item xs={4}>
                  <ButtonBase 
                    className={[activeMetric == MetricType.CPU_USAGE ? classes.activeColor : classes.inactiveColor, classes.pieChartButton].filter(e => !!e).join(' ')}
                    style={{ width:"100%", height:"100%"}} onClick={() => {setActiveMetric(MetricType.CPU_USAGE)}}>
                    {mem == undefined ? (
                      <Alert severity="error"> No CPU data to show </Alert>
                    ) : (
                      <MetricPieChart metric={cpu} name="CPU" rule={cpuRule} />
                    )}
                  </ButtonBase>
                </Grid>
                <Grid item xs={4}>
                  <ButtonBase 
                    className={[activeMetric == MetricType.MEMORY_USAGE ? classes.activeColor : classes.inactiveColor, classes.pieChartButton].filter(e => !!e).join(' ')} 
                    style={{ width:"100%", height:"100%"}} onClick={() => {setActiveMetric(MetricType.MEMORY_USAGE)}}>
                    {mem == undefined ? (
                      <Alert severity="error"> No memory data to show </Alert>
                    ) : (
                      <MetricPieChart metric={mem} name="MEMORY" rule={memRule} />
                    )}
                  </ButtonBase>
                </Grid>
                <Grid item xs={4}>
                  <ButtonBase
                    className={[activeMetric == MetricType.DISK_USAGE ? classes.activeColor : classes.inactiveColor, classes.pieChartButton].filter(e => !!e).join(' ')}
                    style={{ width:"100%", height:"100%"}} onClick={() => {setActiveMetric(MetricType.DISK_USAGE)}}>
                    {mem == undefined ? (
                      <Alert severity="error"> No disk data to show </Alert>
                    ) : (
                      <MetricPieChart metric={disk} name="DISK" rule={diskRule} />
                    )}
                  </ButtonBase>
                </Grid>
              </Grid>
              <Grid item className={[classes.activeColor, classes.shortenTopMargin].filter(e => !!e).join(' ')}>
                <InfluxHistory hostId={hostId} activeMetric={activeMetric}/>
              </Grid>
            </Grid>
          </CardContent>
          <HostMenu
            anchorEl={anchorEl}
            open={open}
            handleClose={handleClose}
            hostId={hostData.id}
          />
        </Card>
      ) : (
        <Alert severity="error"> Host not found </Alert>
      )}
    </>
  );
};

export default HostBoard;
