import React from "react";
import {
  Typography,
  LinearProgress,
  LinearProgressProps,
  Box,
  Grid,
} from "@material-ui/core";

function LinearProgressWithLabel(
  props: LinearProgressProps & { value: number }
) {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

const ProgressBarComponent: React.FC<{
  name: string;
  used: string;
  total?: string;
  percent: number;
}> = ({ name, used, total = "", percent }) => {
  return (
    <Grid container justify="flex-start" alignItems="center" spacing={2}>
      <Grid item xs={2}>
        <Typography variant="subtitle1">{name + ":"}</Typography>
      </Grid>
      <Grid item xs={5}>
        <Typography variant="subtitle1">
          {used + (!!total ? ` / ${total}` : "")}
        </Typography>
      </Grid>
      <Grid item xs={12} md={5}>
        <LinearProgressWithLabel variant="determinate" value={percent} />
      </Grid>
    </Grid>
  );
};

export default ProgressBarComponent;
