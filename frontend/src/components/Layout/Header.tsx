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
    zIndex: theme.zIndex.drawer + 1,
  },
}));

const Header: React.FC = () => {
  const classes = useStyles();

  return (
    <Box>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h5" color="primary">
            DockerBuddy
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Header;
