import { makeStyles, Theme } from "@material-ui/core";
import { Alert, Box, Grid, Typography } from "@mui/material";
import React from "react";
import { AlertType, RuleType } from "../../common/enums";
import { BasicMetric, HostBasicRule } from "../../common/types";
import { alertColors } from "../../util/alertStyle";
import { alertTypeToColor, humanFileSize } from "../../util/util";
import { CloudDownload, CloudUpload } from "@material-ui/icons";

interface NetworkInfoProps {
  networkIn: BasicMetric | undefined;
  networkOut: BasicMetric | undefined;
  rules: HostBasicRule[];
}

const useStyles = makeStyles((theme: Theme) => ({
  warn: {
    color: alertColors.yellow,
  },
  critical: {
    color: alertColors.red,
  },
  textPrimary: {
    color: theme.palette.text.primary,
  },
  disabled: {
    color: theme.palette.text.secondary,
  },
}));

const NetworkInfo: React.FC<NetworkInfoProps> = ({
  networkIn,
  networkOut,
  rules,
}) => {
  const classes = useStyles();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const inColor = alertTypeToColor(AlertType[networkIn?.alertType]);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  const outColor = alertTypeToColor(AlertType[networkOut?.alertType]);

  const inRule = rules.find((r) => RuleType[r.type] == RuleType.NETWORK_IN);
  const outRule = rules.find((r) => RuleType[r.type] == RuleType.NETWORK_OUT);

  return (
    <>
      {networkIn && networkOut ? (
        <Grid container style={{ margin: "20px 0px" }}>
          <Grid
            item
            xs={6}
            container
            style={{
              padding: "10px",
            }}
          >
            <Grid item xs={12} justifyContent="center">
              <Typography variant="h5" textAlign="center">
                Network download
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              container
              justifyContent="center"
              alignItems="center"
            >
              <Box textAlign="center" ml={5}>
                <Typography variant="body1">Alerts at:</Typography>
                <Typography variant="body1">
                  {inRule != undefined ? (
                    <>
                      {"[ "}
                      <g className={classes.warn}>{`${humanFileSize(
                        inRule.warnLevel
                      )}, `}</g>
                      <g className={classes.critical}>{`${humanFileSize(
                        inRule.criticalLevel
                      )}`}</g>
                      {" ]"}
                    </>
                  ) : (
                    <g className={classes.disabled}>[ No alerts defined ]</g>
                  )}
                </Typography>
              </Box>
              <Box textAlign="center" color={inColor} ml={5}>
                <Typography variant="h6">
                  {humanFileSize(networkIn.value)}
                </Typography>
                <CloudDownload />
              </Box>
            </Grid>
          </Grid>

          <Grid
            item
            xs={6}
            container
            style={{
              padding: "10px",
            }}
          >
            <Grid item xs={12} justifyContent="center">
              <Typography variant="h5" textAlign="center">
                Network upload
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              container
              justifyContent="center"
              alignItems="center"
            >
              <Box textAlign="center" color={outColor} mr={5}>
                <CloudUpload />
                <Typography variant="h6">
                  {humanFileSize(networkOut.value)}
                </Typography>
              </Box>
              <Box textAlign="center" mr={5}>
                <Typography variant="body1">Alerts at:</Typography>
                <Typography variant="body1">
                  {outRule != undefined ? (
                    <>
                      {"[ "}
                      <g className={classes.warn}>{`${humanFileSize(
                        outRule.warnLevel
                      )}, `}</g>
                      <g className={classes.critical}>{`${humanFileSize(
                        outRule.criticalLevel
                      )}`}</g>
                      {" ]"}
                    </>
                  ) : (
                    <g className={classes.disabled}>[ No alerts defined ]</g>
                  )}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <Grid item>
          <Alert severity="error"> NO NETWORK INFO </Alert>
        </Grid>
      )}
    </>
  );
};

export default NetworkInfo;
