import React from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import HostCardComponent from "./HostCardComponent";
import PrintHosts from "../AATemporary/PrintHosts";
import { useAppSelector } from "../../app/hooks";
import { selectHost } from "../../hosts/hostsSlice";
import { FullHostSummary } from "../../hosts/types";

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
  const hostsData = useAppSelector(selectHost);

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
          hostsData.hosts.map((obj: FullHostSummary) => {
            return (
              <Grid item xs={6} key={obj.ip}>
                <HostCardComponent host={obj} />
              </Grid>
            );
          })}
      </Grid>
      <PrintHosts />
    </div>
  );
};

export default HostsView;
