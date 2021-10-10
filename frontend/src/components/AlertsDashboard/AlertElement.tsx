import { Box, Divider, Grid, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React from "react";
import { AlertsResponseElementParsed, AlertType } from "../../common/types";
import { parseDateToDDMMYYYY, parseDateToHour } from "../../util/util";

interface AlertElementProps {
  alert: AlertsResponseElementParsed;
  showDate: boolean;
}

const AlertElement: React.FC<AlertElementProps> = ({ alert, showDate }) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const severity = AlertType[alert.alertType];
  return (
    <Grid item>
      {showDate && (
        <Box mb={1}>
          <Typography variant="h5">
            {parseDateToDDMMYYYY(alert.time)}
          </Typography>
          <Divider light />
        </Box>
      )}

      <Alert severity={severity}>
        <strong>{parseDateToHour(alert.time)}</strong> Host {alert.hostId}{" "}
        {alert.ruleType} is {alert.percent}%
      </Alert>
    </Grid>
  );
};

export default AlertElement;
