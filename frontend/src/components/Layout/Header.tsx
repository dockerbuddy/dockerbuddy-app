import {
  AppBar,
  Box,
  makeStyles,
  Toolbar,
  Typography,
  Button,
} from "@material-ui/core";

import React from "react";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: theme.palette.background.paper,
    zIndex: theme.zIndex.drawer + 1,
  },
  title: {
    flexGrow: 1,
  },
}));

const Header: React.FC = () => {
  const classes = useStyles();
  return (
    <Box>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Link
            to="/"
            style={{ textDecoration: "none" }}
            className={classes.title}
          >
            <Typography variant="h5" color="primary">
              DockerBuddy
            </Typography>
          </Link>
          <Link
            to="/alerts"
            style={{ textDecoration: "none", marginRight: "10px" }}
          >
            <Button variant="outlined" color="primary">
              Alerts
            </Button>
          </Link>
          <Link to="/addHost" style={{ textDecoration: "none" }}>
            <Button variant="outlined" color="primary">
              Add host
            </Button>
          </Link>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
