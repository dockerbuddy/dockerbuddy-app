/* eslint-disable */
import React from "react";
import {
  makeStyles,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  Divider,
} from "@material-ui/core";
import { alertTypeToColor, extractMetric, humanFileSize } from "../../util/util";
import { Container } from "../../common/types";
import { AlertType, MetricType } from "../../common/enums";
import { AllOutOutlined } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  card: {
    borderColor: "#1A1C19",
    backgroundColor: "#16171B",
  },
  nameColor: {
    color: theme.palette.primary.main,
  },
}));

const ContainerCardComponent: React.FC<{ container: Container }> = ({container}) => {
  const classes = useStyles();
  //todo useClasses, override colors if container is inactive

  const mem = extractMetric(container.metrics, MetricType.MEMORY_USAGE);
  const cpu = extractMetric(container.metrics, MetricType.CPU_USAGE);

  //@ts-ignore
  const imgColor = alertTypeToColor(AlertType[container.alertType]);
  //@ts-ignore
  const memColor = alertTypeToColor(AlertType[mem?.alertType]);
  //@ts-ignore
  const cpuColor = alertTypeToColor(AlertType[cpu?.alertType]);

  return (
    <Grid 
      container
      direction="column"
      alignItems="center"
      style={{backgroundColor: "#16171B"}}
      spacing={3}
    >
      <Grid item xs={12} justify="center" alignItems="center">
        <AllOutOutlined fontSize="large" style={{ width: 60, height: 60, color: imgColor }} />
        <Typography variant="h5" align="center" style={{ marginTop: -10, color: imgColor}}>
          {container.name}
        </Typography>
      </Grid>

      <Divider variant="middle" orientation="horizontal" flexItem style={{height: 3}}/>

      <Grid item container justify="space-around">
        {/* or space-between */}
        <Grid item xs={5}>
          <Typography variant="h6" align="center" style={{color: cpuColor}}>
            CPU: {cpu?.percent}%
          </Typography>
        </Grid>
        <Divider variant="fullWidth" orientation="vertical" flexItem style={{width: 3}}/>
        <Grid item xs={5}>
          <Typography variant="h6" align="center" style={{color: memColor}}>
            MEM: {mem?.percent}%
          </Typography>
        </Grid>
      </Grid>


    </Grid>

  );
};

export default ContainerCardComponent;
