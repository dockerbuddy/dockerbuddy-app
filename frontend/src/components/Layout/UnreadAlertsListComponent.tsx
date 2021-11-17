import { MenuItem, ListItemText, Divider } from "@material-ui/core";
import { Menu } from "@mui/material";
import React, { useEffect, useState } from "react";
import { proxy } from "../../common/api";
import { AlertsResponseElement, StandardApiResponse } from "../../common/types";
import { reduceBy } from "../../redux/alertCounterSlice";
import { useAppDispatch } from "../../redux/hooks";
import { paramsToString, parseDateToDDMMYYYY } from "../../util/util";
import AlertElement from "../AlertsDashboard/AlertElement";

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
  const dispatch = useAppDispatch();

  const [alerts, setAlerts] = useState<AlertsResponseElement[]>([]);
  const [alertsToDelete, setAlertsToDelete] = useState<AlertsResponseElement[]>(
    []
  );
  const [isAll, setIsAll] = useState<boolean>(false);

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
      if (response.ok) {
        dispatch(reduceBy(alertsToDelete.length));
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
    if (isAll) {
      setAlertsToDelete([]);
    } else {
      setAlertsToDelete(alerts);
    }
    setIsAll((isAll) => !isAll);
  };

  let prev = "";

  //todo display info when there are no alerts whatsoever, make alerts max length, improve select/deselect all button, make alert not link to their hosts -> make separate button for it
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
      <>
        <MenuItem onClick={handleAll}>
          <ListItemText>{isAll ? "Deselect all" : "Select all"}</ListItemText>
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
              key={
                alert.alertMessage + alert.hostId + alert.alertType + alert.time
              }
              onClick={() => handleAlertClick(alert)}
            >
              <AlertElement
                alert={alert}
                key={alert.time.getTime()}
                showDate={showDate}
              />
              {/* <ListItemIcon>
              <Edit />
            </ListItemIcon> */}
            </MenuItem>
          );
        })}
      </>
    </Menu>
  );
};

export default UnreadAlertsListComponent;