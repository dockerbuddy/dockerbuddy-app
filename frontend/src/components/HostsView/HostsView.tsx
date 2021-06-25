import React from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { useHostsData } from "../../context/HostContext";
import HostCardComponent from "./HostCardComponent";

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
  white: {
    backgroundColor: "#999999",
  },
  blue: {
    borderColor: "#1A1C19",
    backgroundColor: "#1D1F22",
  },
  green: {
    backgroundColor: "#00ff00",
  },
}));

const HostsView: React.FC = () => {
  const classes = useStyles();
  const hostsData = useHostsData();

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        {hostsData.status === "ERROR" && (
          <Grid item>
            <Alert severity="error"> BRAK POLACZENIA Z SERWEREM </Alert>
          </Grid>
        )}
        {hostsData.status === "LOADING" && <p>LOADING</p>}
        {hostsData.status === "LOADED" &&
          hostsData.hosts.map((obj: HostData) => {
            return (
              <Grid item xs={6} key={obj.ip}>
                <HostCardComponent ip={obj.ip} name={obj.name} />
              </Grid>
            );
          })}
      </Grid>
    </div>
  );
};

export default HostsView;
