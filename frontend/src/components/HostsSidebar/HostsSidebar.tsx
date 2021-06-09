/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Drawer,
  Theme,
  Toolbar,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import { proxy } from "../../common/api";

const drawerWidth = 240;
const useStyles = makeStyles((theme: Theme) => ({
  sideBar: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    border: 0,
    backgroundColor: "#2A2B2F",
    width: drawerWidth,
  },
  drawerContainer: {
    overflow: "auto",
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

const HostsSidebar: React.FC = () => {
  const [hosts, setHosts] = useState([]);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const classes = useStyles();

  useEffect(() => {
    async function asyncFetch() {
      const response = await fetch(`${proxy}/hosts`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const json = await response.json();
        setIsLoading(false);
        setHosts(json);
      } else {
        setIsLoading(false);
        setError(true);
        throw new Error(`Response code is ${response.status}`);
      }
    }

    asyncFetch();
  }, []);

  console.log(hosts);

  return (
    <Drawer
      className={classes.sideBar}
      variant="permanent"
      classes={{
        paper: classes.drawerPaper,
      }}
    >
      <Toolbar />
      <div className={classes.drawerContainer}>
        <List>
          {["TMP"].map((text, index) => (
            <ListItem button key={text}>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </div>
    </Drawer>
  );
};

export default HostsSidebar;
