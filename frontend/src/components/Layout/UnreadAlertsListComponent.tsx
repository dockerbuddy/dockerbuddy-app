import {
  MenuItem,
  ListItemText,
  Divider,
  Grid,
  IconButton,
  Typography,
} from "@material-ui/core";
import { Link } from "@material-ui/icons";
import { makeStyles } from "@material-ui/styles";
import { Menu } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { proxy } from "../../common/api";
import { AlertsResponseElement, StandardApiResponse } from "../../common/types";
import { setCounter } from "../../redux/alertCounterSlice";
import { useAppDispatch } from "../../redux/hooks";
import { paramsToString, parseDateToDDMMYYYY } from "../../util/util";
import AlertElement from "../AlertsDashboard/AlertElement";

const useStyles = makeStyles(() => ({
  disableHover: {
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  noAlerts: {
    padding: "20px",
    color: "rgb(229, 209, 208)",
  },
}));

interface AlertsListProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  handleClose: () => void;
}

const UnreadAlertsListComponent: React.FC<AlertsListProps> = ({
  anchorEl,
  open,
  handleClose,
}) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();

  const [alerts, setAlerts] = useState<AlertsResponseElement[]>([]);
  const [alertsToDelete, setAlertsToDelete] = useState<AlertsResponseElement[]>(
    []
  );
  const [highlight, setHighlight] = useState<boolean>(true);

  useEffect(() => {
    if (open) {
      onOpen();
    } else {
      onClose();
    }
  }, [open]);

  const onOpen = async () => {
    const params = {
      fetchAll: false,
      start: 1,
      read: false,
    };
    const response = await fetch(
      `${proxy}/influxdb/alerts?` + paramsToString(params)
    );
    const result: StandardApiResponse<AlertsResponseElement[]> =
      await response.json();
    if (response.ok) {
      const alertsParsed: AlertsResponseElement[] = result.body.map(
        (alert) => ({
          ...alert,
          time: new Date(alert.time),
        })
      );
      setAlerts(alertsParsed);
    }
  };

  const onClose = async () => {
    if (alertsToDelete.length > 0) {
      const response = await fetch(`${proxy}/influxdb/alerts`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(alertsToDelete),
      });
      const result = await response.json();
      if (response.ok) {
        dispatch(setCounter(result.body));
        setAlertsToDelete([]);
      } else {
        //todo do something
      }
    }
  };

  const handleAlertClick = (alert: AlertsResponseElement) => {
    if (alertsToDelete.includes(alert)) {
      setAlertsToDelete((arr) => arr.filter((a) => a != alert));
    } else {
      setAlertsToDelete((arr) => [...arr, alert]);
    }
  };

  const handleAll = () => {
    if (alerts.length == alertsToDelete.length) {
      setAlertsToDelete([]);
    } else {
      setAlertsToDelete(alerts);
    }
  };

  const history = useHistory();
  const clickLink = (
    e: React.MouseEvent<HTMLButtonElement>,
    hostId: string
  ) => {
    e.stopPropagation();
    history.push(`/host/${hostId}`);
  };

  let prev = "";

  return (
    <Menu
      id="basic-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      PaperProps={{
        style: {
          maxHeight: "80vh",
          width: "40vw",
        },
      }}
    >
      {alerts.length == 0 ? (
        <Typography align="center" className={classes.noAlerts} variant="h6">
          There are no unread alerts!
        </Typography>
      ) : (
        <>
          <MenuItem onClick={handleAll}>
            <ListItemText>
              <Typography variant="h6" color="textPrimary">
                <strong>
                  {alerts.length == alertsToDelete.length
                    ? "Deselect all"
                    : "Select all"}
                </strong>
              </Typography>
            </ListItemText>
          </MenuItem>
          <Divider />
          {Object.values(alerts).map((alert: AlertsResponseElement) => {
            let showDate = false;
            if (parseDateToDDMMYYYY(alert.time) != prev) {
              prev = parseDateToDDMMYYYY(alert.time);
              showDate = true;
            }
            return (
              <MenuItem
                selected={alertsToDelete.includes(alert)}
                onClick={() => handleAlertClick(alert)}
                key={
                  alert.alertMessage +
                  alert.hostId +
                  alert.alertType +
                  alert.time
                }
                className={highlight ? undefined : classes.disableHover}
              >
                <Grid container alignItems="flex-end">
                  <Grid item xs={1}>
                    <IconButton
                      onClick={(e) => clickLink(e, alert.hostId)}
                      onMouseEnter={() => setHighlight(false)}
                      onMouseLeave={() => setHighlight(true)}
                    >
                      <Link color="primary" />
                    </IconButton>
                  </Grid>
                  <Grid
                    item
                    container
                    xs={11}
                    style={{ pointerEvents: "none" }}
                  >
                    <AlertElement
                      alert={alert}
                      key={alert.time.getTime()}
                      showDate={showDate}
                    />
                  </Grid>
                </Grid>
              </MenuItem>
            );
          })}
        </>
      )}
    </Menu>
  );
};

export default UnreadAlertsListComponent;
