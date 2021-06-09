import React, { useEffect, useState } from "react";
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
import { proxy } from "../../common/api";
import { capitalizeFirstLetter } from "../../util/util";

interface HostData {
  name: string;
  ip: string;
}

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
  const [hosts, setHosts] = useState({ hosts: [] });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const classes = useStyles();

  useEffect(() => {
    async function asyncFetch() {
      const response = await fetch(`${proxy}/hosts`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await response.json();
      if (response.ok) {
        setIsLoading(false);
        setHosts(json);
      } else {
        setIsLoading(false);
        setError(json);
        throw new Error(`Response code is ${response.status}`);
      }
    }

    asyncFetch();
  }, []);

  console.log(hosts["hosts"]);

  return (
    <Drawer
      className={classes.sideBar}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <Toolbar />
      {error && (
        <Grid item>
          <Alert severity="error">{capitalizeFirstLetter(error)}</Alert>
        </Grid>
      )}
      {isLoading && <p>LOADING</p>}
      <List>
        {hosts["hosts"].map((obj: HostData) => {
          const name = obj["name"];
          const ip = obj["ip"];
          return (
            <ListItem button key={ip}>
              <ListItemText primary={`${name} | ${ip}`} />
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default HostsSidebar;
