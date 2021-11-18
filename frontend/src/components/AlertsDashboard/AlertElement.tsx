import { Box, Divider, Grid, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React from "react";
import { Link } from "react-router-dom";
import { AlertsResponseElement } from "../../common/types";
import { parseDateToDDMMYYYY, parseDateToHour } from "../../util/util";
import { AlertType } from "../../common/enums";

interface AlertElementProps {
  alert: AlertsResponseElement;
  showDate: boolean;
}

const AlertElement: React.FC<AlertElementProps> = ({ alert, showDate }) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const severity = AlertType[alert.alertType];
  return (
    <Grid item style={{ width: "100%" }}>
      {showDate && (
        <Box mb={1}>
          <Typography variant="h5">
            {parseDateToDDMMYYYY(alert.time)}
          </Typography>
          <Divider light />
        </Box>
      )}

      <Link to={`/host/${alert.hostId}`} style={{ textDecoration: "none" }}>
        <Alert severity={severity}>
          <strong>{parseDateToHour(alert.time)}</strong> {alert.alertMessage}
        </Alert>
      </Link>
    </Grid>
  );
};

export default AlertElement;
