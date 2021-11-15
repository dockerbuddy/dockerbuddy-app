import {
  Card,
  CardContent,
  Container,
  Grid,
  IconButton,
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
              <HostStats hostData={hostData} />
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
