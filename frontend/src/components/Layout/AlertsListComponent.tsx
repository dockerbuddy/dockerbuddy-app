import { Menu, MenuItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { Edit } from "@material-ui/icons";
import React, { useEffect, useState } from "react";
import { proxy } from "../../common/api";
import { AlertsResponseElement, StandardApiResponse } from "../../common/types";
import { paramsToString } from "../../util/util";
import AlertElement from "../AlertsDashboard/AlertElement";

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
  const [alerts, setAlerts] = useState<AlertsResponseElement[]>([]);
  const [alertsToDelete, setAlertsToDelete] = useState<AlertsResponseElement[]>(
    []
  );

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
      setAlerts(result.body);
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
        setAlertsToDelete([]);
      } else {
        console.log("COULDN'T DELETE");
      }
    }
  };

  const handleAlertClick = (alert: AlertsResponseElement) => {
    if (alertsToDelete.includes(alert)) {
      setAlertsToDelete((arr) => arr.filter((a) => a === alert));
    } else {
      setAlertsToDelete((arr) => [...arr, alert]);
    }
  };

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
        return (
          <MenuItem
            key={
              alert.alertMessage + alert.hostId + alert.alertType + alert.time
            }
            onClick={() => handleAlertClick(alert)}
          >
            <ListItemIcon>
              <Edit />
            </ListItemIcon>
            <AlertElement alert={alert} showDate={true} />
            {/* <ListItemText>{alert.alertMessage}</ListItemText> */}
          </MenuItem>
        );
      })}

      {/* <MenuItem>
        <ListItemIcon>
          <HighlightOff fontSize="small" />
        </ListItemIcon> */}
      <ListItemText>Delete all</ListItemText>
      {/* </MenuItem> */}
    </Menu>
  );
};

export default AlertsListComponent;
