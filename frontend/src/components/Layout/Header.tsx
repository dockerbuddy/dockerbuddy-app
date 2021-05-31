import {
  AppBar,
  Box,
  makeStyles,
  Toolbar,
  Typography,
} from "@material-ui/core";

import React from "react";

const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: theme.palette.background.paper,
  },
}));

const Header: React.FC = () => {
  const classes = useStyles();

  return (
    <Box>
      <AppBar position="static" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h4" color="primary">
            DockerBuddy
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
