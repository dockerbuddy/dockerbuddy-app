import {
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
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
import HostStats from "./HostStats/HostStats";
import HostInfo from "./HostInfo/HostInfo";

type HParam = { id: string };

const HostBoard: React.FC<RouteComponentProps<HParam>> = ({ match }) => {
  const hostId = match.params.id;
  const hostData = useAppSelector(selectHost).hosts[hostId];
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const components = {
    "1": <HostInfo hostData={hostData} />,
    "2": <HostInfo hostData={hostData} />,
    "3": <HostStats hostData={hostData} />,
  };

  const [value, setValue] = React.useState<string>("1");
  const [displayedComponent, setDisplayedComponent] =
    React.useState<JSX.Element>(components["1"]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (event: any, newValue: string) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    setDisplayedComponent(components[newValue]);
    setValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      {hostData !== undefined ? (
        <Card>
          <CardContent>
            <Grid container direction="column" spacing={3}>
              <Grid item container direction="column" spacing={1}>
                <Grid item container justify="space-between">
                  <Grid item>
                    <Typography
                      variant="h4"
                      style={{ display: "inline-block" }}
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
                  <Typography variant="subtitle1">ID: {hostData.id}</Typography>
                </Grid>
                <Grid item>
                  <Typography variant="subtitle1">
                    IP Address: {hostData.ip}
                  </Typography>
                </Grid>
              </Grid>
              <Tabs value={value} onChange={handleChange}>
                <Tab label="Details" value={"1"} />
                <Tab label="Alerts" value={"2"} />
                <Tab label="Charts" value={"3"} />
              </Tabs>
              <Grid item>{displayedComponent}</Grid>
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
        <Alert severity="error"> Host not found </Alert>
      )}
    </Container>
  );
};

export default HostBoard;
