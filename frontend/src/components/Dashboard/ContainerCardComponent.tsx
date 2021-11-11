/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState } from "react";
import {
  makeStyles,
  Typography,
  Grid,
  Divider,
  IconButton,
  Tooltip,
} from "@material-ui/core";
import { alertTypeToColor, extractMetric } from "../../util/util";
import { Container } from "../../common/types";
import { AlertType, MetricType, ReportStatus } from "../../common/enums";
import { AllOutOutlined, VisibilityOff, Visibility } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { proxy } from "../../common/api";

const useStyles = makeStyles(() => ({
  newContainer: {
    backgroundColor: "transparent",
    border: "3px solid",
    borderColor: "rgb(47, 40, 49)",
    boxShadow: "inset 0px 0px 5px 5px #3ED7C2",
  },
  watchedContainer: {
    backgroundColor: "transparent",
    border: "3px solid",
    borderColor: "#ababab",
  },
  nonWatchedContainer: {
    backgroundColor: "transparent",
    border: "3px solid",
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
    color: "#3d3d3d",
  },
}));

const ContainerCardComponent: React.FC<{
  container: Container;
  hostId: string;
}> = ({ container, hostId }) => {
  const classes = useStyles();
  //todo useClasses, override colors if container is inactive

  const mem = extractMetric(container.metrics, MetricType.MEMORY_USAGE);
  const cpu = extractMetric(container.metrics, MetricType.CPU_USAGE);

  const [reportStatus, setReportStatus] = useState<ReportStatus>(
    ReportStatus.NEW //container.reportStatus
  );
  const isNew = () => {
    return reportStatus == ReportStatus.NEW;
  };
  const isWatched = () => {
    return reportStatus == ReportStatus.WATCHED;
  };

  //@ts-ignore
  const imgColor = alertTypeToColor(AlertType[container.alertType]);
  //@ts-ignore
  const memColor = alertTypeToColor(AlertType[mem?.alertType]);
  //@ts-ignore
  const cpuColor = alertTypeToColor(AlertType[cpu?.alertType]);

  const changeWatchedStatus = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newStatus = isWatched()
      ? ReportStatus.NOT_WATCHED
      : ReportStatus.WATCHED;
    setReportStatus(newStatus);
    changeContainerReportStatus(newStatus);
    e.preventDefault();
  };

  const disableNewContainer = () => {
    setReportStatus(ReportStatus.NOT_WATCHED);
    changeContainerReportStatus(ReportStatus.NOT_WATCHED);
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
      to={{}}
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
        spacing={3}
      >
        <Grid item container xs={12}>
          <Grid item xs={2}></Grid>
          <Grid
            item
            container
            direction="column"
            xs={8}
            justify="center"
            alignItems="center"
          >
            <Grid item>
              <AllOutOutlined
                fontSize="large"
                className={classes.dockerIcon}
                style={{ color: imgColor }}
              />
            </Grid>
            <Grid item>
              <Typography
                variant="subtitle1"
                align="center"
                style={{ marginTop: -10, color: imgColor }}
              >
                {container.name}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={2}>
            <IconButton onClick={changeWatchedStatus}>
              {isWatched() ? (
                <Visibility className={classes.enabled} />
              ) : (
                <VisibilityOff className={classes.disabled} />
              )}
            </IconButton>
          </Grid>
        </Grid>

        <Divider
          variant="middle"
          orientation="horizontal"
          flexItem
          style={{ height: 3 }}
        />

        <Grid item container justify="space-around">
          {/* or space-between */}
          <Grid item xs={5}>
            <Tooltip arrow title={cpu?.value + "/" + cpu?.total}>
              <Typography
                variant="subtitle1"
                align="center"
                style={{ color: cpuColor }}
              >
                CPU: {cpu?.percent.toFixed(2)}%
              </Typography>
            </Tooltip>
          </Grid>
          <Divider
            variant="fullWidth"
            orientation="vertical"
            flexItem
            style={{ width: 3 }}
          />
          <Grid item xs={5}>
            <Tooltip arrow title={mem?.value + "/" + mem?.total}>
              <Typography
                variant="subtitle1"
                align="center"
                style={{ color: memColor }}
              >
                MEM: {mem?.percent.toFixed(2)}%
              </Typography>
            </Tooltip>
          </Grid>
        </Grid>
      </Grid>
    </Link>
  );
};

export default ContainerCardComponent;
