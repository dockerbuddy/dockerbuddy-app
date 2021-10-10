import {
  Container,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useEffect } from "react";
import { proxy } from "../../common/api";
import { AlertsResponse } from "../../common/types";

const AlertsDashboard: React.FC = () => {
  useEffect(() => {
    const fetchAlerts = async () => {
      const response = await fetch(`${proxy}/influxdb/alerts?start=-${1}d`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        //DO SOMETHING
        return;
      }

      const json: AlertsResponse = await response.json();
      console.log(json);
    };

    fetchAlerts();
  }, []);

  return (
    <Container maxWidth="md">
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Typography variant="h4">Alerts</Typography>
        </Grid>
        <Grid item container spacing={2} alignItems="center">
          <Grid item>
            <Typography variant="subtitle1">Show alerts from last </Typography>
          </Grid>
          <Grid item>
            <TextField
              id="start-day"
              variant="outlined"
              type="number"
              size="small"
              style={{ width: "60%" }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">days</InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AlertsDashboard;
