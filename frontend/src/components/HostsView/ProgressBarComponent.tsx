import React from "react";
import {
  Typography,
  LinearProgress,
  LinearProgressProps,
  Box,
  Grid,
} from "@material-ui/core";
import { makeStyles, createStyles, withStyles, Theme } from '@material-ui/core/styles';


const BorderLinearProgress = withStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 8,
      borderRadius: 5,
    },
    colorPrimary: {
      backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
    },
    bar: {
      borderRadius: 5,
    },
  }),
)(LinearProgress);

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number }
) {
  return (
    <Box display="flex" alignItems="center">
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
      <Box width="100%" mr={1}>
        <BorderLinearProgress variant="determinate" {...props} />
      </Box>
    </Box>
  );
}

const ProgressBarComponent: React.FC<{
  name: string;
  used: string;
  total: string;
  percent: number;
}> = ({ name, used, total, percent }) => {
  return (
    <Grid container justify="flex-start" alignItems="center" spacing={2}>
      <Grid item md={12} style={{minWidth: "250px"}} >
        <Typography variant="subtitle1" display="inline">
          {name + ":\t" + used + " / " + total}
          <LinearProgressWithLabel variant="determinate" value={percent} />
        </Typography>
      </Grid>
      {/* <Grid item md={3}>
        <Typography variant="subtitle1">{used + " / " + total}</Typography>
      </Grid> */}
      {/* <Grid item xs={12} md={8}>
        <LinearProgressWithLabel variant="determinate" value={percent} />
      </Grid> */}
    </Grid>
  );
};

export default ProgressBarComponent;
