import React, { useEffect } from "react";
import { makeStyles, Grid } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import HostCardComponent from "./HostCardComponent";
import { selectHost, updateHostsAsync } from "../../redux/hostsSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { Host } from "../../common/types";
import NoHostsComponent from "./NoHostsComponent";

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

const Dashboard: React.FC = () => {
  const classes = useStyles();
  const hostsData = useAppSelector(selectHost);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(updateHostsAsync());
  }, []);

  return (
    <div className={classes.root}>
      {hostsData.status === "ERROR" && (
        <Grid item>
          <Alert severity="error"> BRAK POLACZENIA Z SERWEREM </Alert>
        </Grid>
      )}
      {(hostsData.status === "LOADED" || hostsData.status === "LOADING") &&
        (Object.values(hostsData.hosts).length == 0 ? (
          <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justify="flex-end"
            style={{ minHeight: "50vh" }}
          >
            <NoHostsComponent />
          </Grid>
        ) : (
          <Grid container spacing={2}>
            {Object.values(hostsData.hosts).map((obj: Host) => {
              return (
                <Grid item xs={6} key={obj.ip}>
                  <HostCardComponent host={obj} />
                </Grid>
              );
            })}
          </Grid>
        ))}
      {hostsData.status === "LOADING" &&
        Object.keys(hostsData.hosts).length == 0 && <p>LOADING</p>}
    </div>
  );
};

export default Dashboard;
