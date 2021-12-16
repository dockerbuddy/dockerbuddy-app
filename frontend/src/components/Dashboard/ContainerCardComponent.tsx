/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from "react";
import {
  makeStyles,
  Typography,
  Grid,
  Divider,
  IconButton,
  Tooltip,
  Link,
} from "@material-ui/core";
import { extractMetricPercent, statusTypeToColor } from "../../util/util";
import { Container } from "../../common/types";
import { AlertType, MetricType, ReportStatus } from "../../common/enums";
import { AllOutOutlined, VisibilityOff, Visibility } from "@material-ui/icons";
import { proxy } from "../../common/api";
import { alertColors } from "../../util/alertStyle";
import { Box } from "@mui/system";

const useStyles = makeStyles(() => ({
  newContainer: {
    backgroundColor: "transparent",
    border: "2px solid",
    borderColor: "#3ED7C2",
    boxShadow: "inset 0px 0px 5px 5px #3ED7C2",
  },
  watchedContainer: {
    backgroundColor: "transparent",
    border: "2px solid",
    borderColor: "#ababab",
  },
  nonWatchedContainer: {
    backgroundColor: "transparent",
    border: "2px solid",
    borderColor: "#3d3d3d",
  },
  dockerIcon: {
    width: 60,
    height: 60,
  },
  enabled: {
    color: "#ababab",
  },
  disabled: {
    color: alertColors.disabled,
  },
}));

const ContainerCardComponent: React.FC<{
  container: Container;
  hostId: string;
  mock?: boolean;
}> = ({ container, hostId, mock = false }) => {
  const classes = useStyles();

  const mem = extractMetricPercent(container.metrics, MetricType.MEMORY_USAGE);
  const cpu = extractMetricPercent(container.metrics, MetricType.CPU_USAGE);

  const [reportStatus, setReportStatus] = useState<ReportStatus>(
    //@ts-ignore
    ReportStatus[container.reportStatus]
  );

  const isNew = () => {
    return reportStatus == ReportStatus.NEW;
  };
  const isWatched = () => {
    return reportStatus == ReportStatus.WATCHED;
  };

  const imgColor = statusTypeToColor(
    //@ts-ignore
    AlertType[container.alertType],
    //@ts-ignore
    ReportStatus[container.reportStatus],
    container.status
  );
  const textColor = imgColor === alertColors.red ? alertColors.red : imgColor;

  const changeWatchedStatus = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!mock) {
      const newStatus = isWatched()
        ? ReportStatus.NOT_WATCHED
        : ReportStatus.WATCHED;
      setReportStatus(newStatus);
      changeContainerReportStatus(newStatus);
      e.preventDefault();
    }
  };

  const disableNewContainer = () => {
    if (!mock) {
      setReportStatus(ReportStatus.NOT_WATCHED);
      changeContainerReportStatus(ReportStatus.NOT_WATCHED);
    }
  };

  const changeContainerReportStatus = async (newStaus: ReportStatus) => {
    const json = {
      containerName: container.name,
      reportStatus: newStaus,
    };

    return fetch(`${proxy}/hosts/${hostId}/container`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    });
  };

  const getContainerClass = (reportStatus: ReportStatus) => {
    switch (reportStatus) {
      case ReportStatus.NEW:
        return classes.newContainer;
      case ReportStatus.WATCHED:
        return classes.watchedContainer;
    }
    return classes.nonWatchedContainer;
  };

  return (
    <Link
      onMouseEnter={
        isNew()
          ? disableNewContainer
          : () => {
              return;
            }
      }
      style={{ color: "inherit", textDecoration: "none" }}
    >
      <Grid
        container
        direction="column"
        alignItems="center"
        className={getContainerClass(reportStatus)}
        style={{ paddingTop: "15px", paddingBottom: "15px" }}
        spacing={1}
      >
        <Grid item container xs={12} justify="center" alignItems="center">
          <Grid item xs={3}></Grid>
          <Grid item container xs={6} justify="center" alignItems="center">
            <AllOutOutlined
              fontSize="large"
              className={classes.dockerIcon}
              style={{ color: imgColor }}
            />
          </Grid>
          <Grid item xs={3}>
            <IconButton onClick={changeWatchedStatus}>
              {isWatched() ? (
                <Visibility className={classes.enabled} />
              ) : (
                <VisibilityOff className={classes.disabled} />
              )}
            </IconButton>
          </Grid>
          <Grid item container justify="center" alignItems="center">
            <Typography
              variant="subtitle1"
              align="center"
              style={{
                paddingLeft: 10,
                paddingRight: 10,
                color: imgColor,
              }}
              noWrap
            >
              {container.name}
            </Typography>
          </Grid>
        </Grid>

        <Grid item container justify="space-around" spacing={1}>
          <Grid item xs={12}>
            <Divider
              variant="middle"
              orientation="horizontal"
              flexItem
              style={{ height: 3 }}
            />
          </Grid>
          <Grid item xs={6}>
            <Tooltip arrow title={cpu?.value + "/" + cpu?.total}>
              <Box textAlign="center">
                <Typography
                  variant="subtitle1"
                  align="center"
                  style={{ color: textColor }}
                >
                  CPU:
                </Typography>
                <Typography
                  variant="subtitle1"
                  align="center"
                  style={{ color: textColor }}
                >
                  {cpu?.percent.toFixed(2)}%
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
          <Divider
            variant="fullWidth"
            orientation="vertical"
            flexItem
            style={{ width: 1.5, marginLeft: -1.5 }}
          />
          <Divider
            variant="fullWidth"
            orientation="vertical"
            flexItem
            style={{ width: 1.5, marginRight: -1.5 }}
          />
          <Grid item xs={6}>
            <Tooltip arrow title={mem?.value + "/" + mem?.total}>
              <Box textAlign="center">
                <Typography
                  variant="subtitle1"
                  align="center"
                  style={{ color: textColor }}
                >
                  MEM:
                </Typography>
                <Typography
                  variant="subtitle1"
                  align="center"
                  style={{ color: textColor }}
                >
                  {mem?.percent.toFixed(2)}%
                </Typography>
              </Box>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
    </Link>
  );
};

export default ContainerCardComponent;
