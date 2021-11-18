import {
  Box,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { proxy } from "../../common/api";
import { AlertsResponseElement, StandardApiResponse } from "../../common/types";
import AlertsList from "./AlertsList";
import { Sync } from "@material-ui/icons";

interface AlertsDashboardProps {
  hostId?: string;
  onlyList?: boolean;
}

const AlertsDashboard: React.FC<AlertsDashboardProps> = ({
  hostId = "",
  onlyList = false,
}) => {
  const [alerts, setAlerts] = useState<AlertsResponseElement[]>([]);
  const [days, setDays] = useState<string>("1");
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const fetchAlerts = async () => {
    setIsFetching(true);
    const hostIdParam = hostId ? `&hostId=${hostId}` : "";
    const response = await fetch(
      `${proxy}/influxdb/alerts?start=-${parseInt(days)}d` + hostIdParam,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      //DO SOMETHING
      return;
    }

    const json: StandardApiResponse<AlertsResponseElement[]> =
      await response.json();

    const alertsParsed: AlertsResponseElement[] = json.body.map((alert) => ({
      ...alert,
      time: new Date(alert.time),
    }));
    if (onlyList) setAlerts(alertsParsed.slice(0, 6));
    else setAlerts(alertsParsed);
    setIsFetching(false);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const refresh = async () => {
    const value = parseInt(days);
    if (isNaN(value) || value <= 0) return;
    fetchAlerts();
  };

  return (
    <Container maxWidth={hostId ? "lg" : "md"}>
      <Grid container direction="column" spacing={2}>
        {!onlyList && (
          <>
            {!onlyList && !hostId && (
              <Grid item>
                <Typography variant="h4">Alerts</Typography>
              </Grid>
            )}

            <Grid item container spacing={2} alignItems="center">
              <Grid item>
                <Typography variant="subtitle1">
                  Show alerts from last{" "}
                </Typography>
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
                    inputProps: { min: 0 },
                  }}
                  value={days}
                  onChange={(event) => setDays(event.target.value)}
                />
              </Grid>
              <Grid item>
                <IconButton onClick={refresh}>
                  <Sync color="primary" />
                </IconButton>
              </Grid>
            </Grid>
          </>
        )}
        <Grid item>
          {isFetching ? (
            <Box justifyContent="center" display="flex" mt={5}>
              <CircularProgress />
            </Box>
          ) : (
            <AlertsList alerts={alerts} />
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default AlertsDashboard;
