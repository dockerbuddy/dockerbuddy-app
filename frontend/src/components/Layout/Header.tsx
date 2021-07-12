import {
  AppBar,
  Box,
  makeStyles,
  Toolbar,
  Typography,
  Button,
} from "@material-ui/core";
import AddHostDialog from "../AddHostDialog/AddHostDialog";

import React, { useState } from "react";

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

  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Box>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Typography variant="h5" color="primary" className={classes.title}>
            DockerBuddy
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setIsOpen(true)}
          >
            Add host
          </Button>
        </Toolbar>
      </AppBar>
      <AddHostDialog isOpen={isOpen} onClose={handleClose} />
    </Box>
  );
};

export default Header;
