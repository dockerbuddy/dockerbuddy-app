/* eslint-disable */
import { Menu, MenuItem, ListItemText, Divider } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { proxy } from "../../common/api";
import { AlertsResponseElement, StandardApiResponse } from "../../common/types";
import { reduceBy } from "../../redux/alertCounterSlice";
import { useAppDispatch } from "../../redux/hooks";
import { paramsToString, parseDateToDDMMYYYY } from "../../util/util";
import AlertElement from "../AlertsDashboard/AlertElement";
// import AlertElement from "../AlertsDashboard/AlertElement";

interface AlertsListProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  handleClose: () => void;
}

const AlertsListComponent: React.FC<AlertsListProps> = ({
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
      `${proxy}/alerts?` + paramsToString(params)
    );
    const result: StandardApiResponse<AlertsResponseElement[]> =
      await response.json();
    if (response.ok) {
      const alertsParsed: AlertsResponseElement[] = result.body.map((alert) => ({
        ...alert,
        time: new Date(alert.time),
      }));
      setAlerts(alertsParsed);
    }
  };

  const onClose = async () => {
    if (alertsToDelete.length > 0) {
      const response = await fetch(`${proxy}/alerts`, {
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
    if(isAll) {
      setAlertsToDelete([]);
    } else {
      setAlertsToDelete(alerts);
    }
    setIsAll((isAll) => !isAll)
  }


  let prev = "";

  return (
    <Menu
      id="basic-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        "aria-labelledby": "basic-button",
      }}
    >
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
      <Divider />
      <MenuItem onClick={handleAll}>
        <ListItemText>{isAll ? "Unselect all" : "Select all"}</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default AlertsListComponent;
