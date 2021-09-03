import React from "react";
import {
  makeStyles,
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  Grid,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { capitalizeFirstLetter } from "../../util/util";
import { useHostsData } from "../../context/HostContext";

const drawerWidth = 240;
const useStyles = makeStyles(() => ({
  sideBar: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    border: 0,
    backgroundColor: "#2A2B2F",
    width: drawerWidth,
  },
}));

const HostsSidebar: React.FC = () => {
  const classes = useStyles();
  const hostsData = useHostsData();

  return (
    <Drawer
      className={classes.sideBar}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <Toolbar />
      {hostsData.status === "ERROR" && (
        <Grid item>
          <Alert severity="error">
            {capitalizeFirstLetter(hostsData.status)}
          </Alert>
        </Grid>
      )}
      {hostsData.status === "LOADING" && <p>LOADING</p>}
      {hostsData.status === "LOADED" && (
        <List>
          {hostsData.hosts.map((obj: HostData) => {
            return (
              <ListItem button key={obj.ip}>
                <ListItemText primary={`${obj.name} | ${obj.ip}`} />
              </ListItem>
            );
          })}
        </List>
      )}
    </Drawer>
  );
};

export default HostsSidebar;
 
