import {
  Container,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@material-ui/core";
import React from "react";

const AlertsDashboard: React.FC = () => {
  return (
    <Container maxWidth="lg">
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
