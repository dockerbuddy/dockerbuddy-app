import { Box, Button, Grid, makeStyles, Typography } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";

const useStyles = makeStyles(() => ({
  box: {
    borderColor: "#1A1C19",
    backgroundColor: "#1D1F22",
    padding: "50px",
  },
  button: {
    marginTop: "15px",
  },
}));

const NoHostsComponent: React.FC = () => {
  const classes = useStyles();

  return (
    <Box className={classes.box} boxShadow={10}>
      <Grid container direction="column" alignItems="center">
        <Typography variant="h6" style={{ display: "inline-block" }}>
          There are no specified hosts. You can start by creating one.
        </Typography>
        <Link to="/addHost" style={{ textDecoration: "none" }}>
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
          >
            Add host
          </Button>
        </Link>
      </Grid>
    </Box>
  );
};

export default NoHostsComponent;
