/* eslint-disable @typescript-eslint/no-unused-vars */
import { Alert, Box, Grid, Typography } from "@mui/material";
import React from "react";
import { AlertType } from "../../common/enums";
import { BasicMetric } from "../../common/types";
import { alertTypeToColor, humanFileSize } from "../../util/util";

interface NetworkInfoProps {
  networkIn: BasicMetric | undefined;
  networkOut: BasicMetric | undefined;
}

const NetworkInfo: React.FC<NetworkInfoProps> = ({ networkIn, networkOut }) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const inColor = alertTypeToColor(AlertType[networkIn?.alertType]);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const outColor = alertTypeToColor(AlertType[networkOut?.alertType]);
  return (
    <Grid container direction="column">
      {networkIn && networkOut ? (
        <>
          <Grid item>
            <Typography variant="subtitle1" display="inline">
              NETWORK:
            </Typography>
          </Grid>
          <Grid item container justifyContent="center">
            <Grid item>
              <Box textAlign="center" mr={5} color={inColor}>
                <Typography variant="h6">
                  {humanFileSize(networkIn.value)}
                </Typography>
                <Typography variant="subtitle1">IN</Typography>
              </Box>
            </Grid>
            <Grid item>
              <Box textAlign="center" color={outColor}>
                <Typography variant="h6">
                  {humanFileSize(networkOut.value)}
                </Typography>
                <Typography variant="subtitle1">OUT</Typography>
              </Box>
            </Grid>
          </Grid>
        </>
      ) : (
        <Grid item>
          <Alert severity="error"> NO NETWORK INFO </Alert>
        </Grid>
      )}
    </Grid>
  );
};

export default NetworkInfo;
