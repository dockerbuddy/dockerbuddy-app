import React from "react";
import {
  Typography,
  LinearProgress,
  LinearProgressProps,
  Box,
  Grid,
  Theme,
  makeStyles,
} from "@material-ui/core";
import { HostPercentRule, PercentMetric } from "../../common/types";
import { alertTypeToColor, humanFileSize } from "../../util/util";
import { AlertType } from "../../common/enums";
import { Alert } from "@mui/material";
import { alertColors } from "../../util/alertStyle";

function LinearProgressWithLabel(
  props: LinearProgressProps & {
    value: number;
    alertColor: string;
    metricRule?: HostPercentRule;
  }
) {
  const useStyles = makeStyles((theme: Theme) => ({
    root: {
      height: 8,
      borderRadius: 5,
    },
    colorPrimary: {
      backgroundColor: theme.palette.grey[700],
    },
    bar: {
      backgroundColor: props.alertColor,
      borderRadius: 5,
    },
    warn: {
      color: alertColors.yellow,
    },
    critical: {
      color: alertColors.red,
    },
    textPrimary: {
      color: theme.palette.text.primary,
    },
    disabled: {
      color: theme.palette.text.secondary,
    },
  }));
  const classes = useStyles();

  return (
    <Box display="flex" alignItems="center">
      <Box minWidth={40} mr={1}>
        <Typography
          variant="body1"
          style={{ color: props.alertColor }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
      <Box width="50%" mr={1}>
        <LinearProgress
          variant="determinate"
          value={props.value}
          classes={classes}
        />
      </Box>
      <Box minWidth={250} mr={1}>
        <Typography variant="body1">
          {props.metricRule != undefined ? (
            <>
              {"[ "}
              <g
                className={classes.warn}
              >{`Warn at ${props.metricRule.warnLevel}%, `}</g>
              <g
                className={classes.critical}
              >{`Critical at ${props.metricRule.criticalLevel}%`}</g>
              {" ]"}
            </>
          ) : (
            <g className={classes.disabled}>[ No alerts defined ]</g>
          )}
        </Typography>
      </Box>
    </Box>
  );
}

const ProgressBarComponent: React.FC<{
  name: string;
  metric: PercentMetric | undefined;
  metricRule?: HostPercentRule;
}> = ({ name, metric, metricRule }) => {
  const used =
    name === "CPU" ? `${metric?.value}%` : humanFileSize(metric?.value);
  const total =
    name === "CPU" ? `${metric?.total}%` : humanFileSize(metric?.total);

  //eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const color = alertTypeToColor(AlertType[metric?.alertType]);

  return (
    <>
      {metric !== undefined ? (
        <Grid container justify="flex-start" alignItems="center" spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" display="inline">
              {name + ":\t" + used + (!!total ? ` / ${total}` : "")}
              <LinearProgressWithLabel
                variant="determinate"
                value={metric.percent}
                alertColor={color}
                metricRule={metricRule}
              />
            </Typography>
          </Grid>
        </Grid>
      ) : (
        <Grid item>
          <Alert severity="error"> NO METRIC INFO </Alert>
        </Grid>
      )}
    </>
  );
};

export default ProgressBarComponent;
