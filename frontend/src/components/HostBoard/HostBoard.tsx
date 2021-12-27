import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  IconButton,
  makeStyles,
  Tab,
  Tabs,
  Typography,
} from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import { Alert } from "@material-ui/lab";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { selectHost } from "../../redux/hostsSlice";
import { useAppSelector } from "../../redux/hooks";
import HostMenu from "./HostMenu";
import HostStats from "./MetricHistory/HostStats";
import HostInfo from "./HostInfo/HostInfo";
import AlertsDashboard from "../AlertsDashboard/AlertsDashboard";

type HParam = { id: string };

const useStyles = makeStyles(() => ({
  inactiveHost: {
    filter: "brightness(15%)",
  },
}));

const HostBoard: React.FC<RouteComponentProps<HParam>> = ({ match }) => {
  const classes = useStyles();

  const hostId = match.params.id;
  const hostData = useAppSelector(selectHost).hosts[hostId];
  const isLoading = useAppSelector(selectHost).status == "LOADING";
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const [value, setValue] = React.useState<string>("1");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (event: any, newValue: string) => {
    setValue(newValue);
  };

  const date = new Date(hostData?.hostSummary?.timestamp);
  const creationDate = new Date(hostData?.creationDate);

  return (
    <div style={{ position: "relative" }}>
      <Container maxWidth="xl">
        {hostData !== undefined ? (
          <Card>
            <CardHeader
              title={
                <Grid item container direction="column" spacing={1}>
                  <Grid item container justify="space-between">
                    <Grid item>
                      <Typography
                        variant="h4"
                        style={{
                          display: "inline-block",
                          color: "rgba(229, 209, 208, 1)",
                        }}
                      >
                        {hostData.hostName}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <IconButton aria-label="settings" onClick={handleClick}>
                        <SettingsIcon color="primary" />
                      </IconButton>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle1">
                      IP Address: {hostData.ip}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle1">
                      ID: {hostData.id}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle1">
                      Created: {creationDate.toUTCString()}
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle1">
                      Last update: {date.toUTCString()}
                    </Typography>
                  </Grid>
                </Grid>
              }
            />
            <CardContent
              className={hostData.isTimedOut ? classes.inactiveHost : ""}
            >
              <Grid container direction="column" spacing={3}>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  indicatorColor="primary"
                >
                  <Tab label="Host Details" value={"1"} />
                  <Tab label="Host Alerts" value={"2"} />
                  <Tab label="Charts" value={"3"} />
                </Tabs>
                <Grid item>
                  {value === "1" && <HostInfo hostData={hostData} />}
                  {value === "2" && <AlertsDashboard hostId={hostId} />}
                  {value === "3" && <HostStats hostData={hostData} />}
                </Grid>
              </Grid>
            </CardContent>
            <HostMenu
              anchorEl={anchorEl}
              open={open}
              handleClose={handleClose}
              hostId={hostData.id}
            />
          </Card>
        ) : (
          !isLoading && <Alert severity="error"> Host not found </Alert>
        )}
      </Container>

      {hostData != undefined && hostData.isTimedOut && (
        <div
          style={{
            position: "absolute",
            top: "45%",
            width: "100%",
            backgroundColor: "transparent",
          }}
        >
          <Typography align="center" variant="h4">
            {`Host is offline`}
          </Typography>
          <Typography align="center" variant="h6" color="textSecondary">
            {hostData.hostSummary != undefined
              ? `Last response at ${date.toLocaleTimeString()}, ${date.toDateString()}`
              : "Last response unavaiable"}
          </Typography>
        </div>
      )}
    </div>
  );
};

export default HostBoard;
