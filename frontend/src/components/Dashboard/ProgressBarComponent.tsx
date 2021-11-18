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
import { BasicMetric } from "../../common/types";
import { alertTypeToColor, humanFileSize } from "../../util/util";
import { AlertType } from "../../common/enums";
import { Alert } from "@mui/material";

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number; alertColor: string }
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
      <Box width="100%" mr={1}>
        <LinearProgress
          variant="determinate"
          value={props.value}
          classes={classes}
        />
      </Box>
    </Box>
  );
}

const ProgressBarComponent: React.FC<{
  name: string;
  metric: BasicMetric | undefined;
}> = ({ name, metric }) => {
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
          <Grid item md={12} style={{ minWidth: "250px" }}>
            <Typography variant="subtitle1" display="inline">
              {name + ":\t" + used + (!!total ? ` / ${total}` : "")}
              <LinearProgressWithLabel
                variant="determinate"
                value={metric.percent}
                alertColor={color}
              />
            </Typography>
          </Grid>
        </Grid>
      ) : (
        <Grid item>
          <Alert severity="error"> NO DISC INFO </Alert>
        </Grid>
      )}
    </>
  );
};

export default ProgressBarComponent;
