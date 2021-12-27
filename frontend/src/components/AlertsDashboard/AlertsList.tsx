import { Grid } from "@material-ui/core";
import React from "react";
import { AlertsResponseElement } from "../../common/types";
import { parseDateToDDMMYYYY } from "../../common/util";
import AlertElement from "./AlertElement";

interface AlertsListProps {
  alerts: AlertsResponseElement[];
}

const AlertsList: React.FC<AlertsListProps> = ({ alerts }) => {
  let prev = "";
  return (
    <Grid container direction="column" spacing={3}>
      {alerts.map((alert) => {
        let showDate = false;
        if (parseDateToDDMMYYYY(alert.time) != prev) {
          prev = parseDateToDDMMYYYY(alert.time);
          showDate = true;
        }
        return (
          <AlertElement
            alert={alert}
            key={alert.time.getTime()}
            showDate={showDate}
          />
        );
      })}
    </Grid>
  );
};

export default AlertsList;
