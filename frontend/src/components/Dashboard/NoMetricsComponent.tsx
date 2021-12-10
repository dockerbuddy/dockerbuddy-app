import { Box, Grid, makeStyles, Typography } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles(() => ({
  box: {
    borderColor: "#1A1C19",
    backgroundColor: "rgba(8,1,9,1)",
    padding: "195px 0px",
  },
}));

const NoMetricsComponent: React.FC<{ hostId: string }> = ({ hostId }) => {
  const classes = useStyles();

  return (
    <Box className={classes.box} boxShadow={10}>
      <Grid container direction="column" alignItems="center">
        <Typography variant="h6">
          This host has not yet sent any metrics.
        </Typography>
        <Typography variant="body1" style={{ marginTop: "10px" }}>
          Please use its id:
        </Typography>
        <Typography variant="h5">{hostId}</Typography>
      </Grid>
    </Box>
  );
};

export default NoMetricsComponent;
