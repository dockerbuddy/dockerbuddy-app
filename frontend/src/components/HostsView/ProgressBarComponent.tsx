/* eslint-disable */
import React from "react";
import {
  makeStyles,
  Card,
  CardHeader,
  Typography,
  IconButton,
  LinearProgress,
  LinearProgressProps,
  Box,
  Grid,
} from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import { humanFileSize, getLatestStats } from "../../util/util";

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

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box minWidth={35}>
        <Typography variant="body2" color="textSecondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

const ProgressBarComponent: React.FC<{ name: string, used: string, total: string, percent: number }> = ({ name, used, total, percent }) => {
  return(
    <Grid container direction="row" justify="flex-start" alignItems="center" spacing={2}>
      <Grid item xs={2}>
        <Typography variant="subtitle1">{name+":"}</Typography>
      </Grid>
      <Grid item xs={5}>
        <Typography variant="subtitle1">{used + " / " + total}</Typography>
      </Grid>
    {/* <Grid container direction="row" justify="space-evenly" alignItems="center" spacing={3}>
      <Box mr={1}>
        <Typography variant="subtitle1">{name+":"}</Typography>
      </Box>
      <Box mr={1}>
        <Typography variant="subtitle1">{used + " / " + total}</Typography>
      </Box> */}

      <Grid item xs={12} md={5}>
        <LinearProgressWithLabel variant="determinate" value={percent} />
      </Grid>
    </Grid>
  );
}

export default ProgressBarComponent;
