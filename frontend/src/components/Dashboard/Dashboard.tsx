import React, { useEffect, useState } from "react";
import {
  makeStyles,
  Grid,
  Container,
  TextField,
  InputAdornment,
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import HostCardComponent from "./HostCardComponent";
import { selectHost, updateHostsAsync } from "../../redux/hostsSlice";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { Host } from "../../common/types";
import NoHostsComponent from "./NoHostsComponent";
import { Search } from "@material-ui/icons";

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
  const [filterName, setFilterName] = useState<string>("");

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(updateHostsAsync());
  }, []);

  return (
    <Container maxWidth="xl" className={classes.root}>
      {hostsData.status === "ERROR" && (
        <Grid item>
          <Alert severity="error"> BRAK POLACZENIA Z SERWEREM </Alert>
        </Grid>
      )}
      {hostsData.status === "LOADED" &&
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
            <Grid item xs={12}>
              <TextField
                id="filter-containers-textfield"
                label="Find host"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                variant="standard"
              />
            </Grid>
            {Object.values(hostsData.hosts).map((obj: Host) => {
              return obj.hostName
                .toLowerCase()
                .includes(filterName.toLowerCase()) ||
                obj.ip.includes(filterName) ? (
                <Grid item xs={12} md={6} key={obj.ip}>
                  <HostCardComponent host={obj} key={obj.ip} />
                </Grid>
              ) : (
                <></>
              );
            })}
          </Grid>
        ))}
      {hostsData.status === "LOADING" &&
        Object.keys(hostsData.hosts).length == 0 && <></>}
    </Container>
  );
};

export default Dashboard;
