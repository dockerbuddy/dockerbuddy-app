import React from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import HostCardComponent from "./HostCardComponent";
import { useAppSelector } from "../../redux/hooks";
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
          Object.values(hostsData.hosts).map((obj: FullHostSummary) => {
            return (
              <Grid item xs={6} key={obj.ip}>
                <HostCardComponent host={obj} />
              </Grid>
            );
          })}
      </Grid>
    </div>
  );
};

export default HostsView;
