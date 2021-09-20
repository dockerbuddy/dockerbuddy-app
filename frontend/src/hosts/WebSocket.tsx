import { Stomp } from "@stomp/stompjs";
import {
  OptionsObject,
  SnackbarKey,
  SnackbarMessage,
  useSnackbar,
} from "notistack";
import React, { useEffect } from "react";
import SockJS from "sockjs-client";
import { AlertType, HostSummary } from "../common/types";
import { useAppDispatch } from "../redux/hooks";
import { updateHostsAsync, updateSingleHost } from "./hostsSlice";

const alertText = (
  hostId: number,
  metricName: string,
  value: number
): string => {
  return `Host ${hostId} ${metricName} is ${value * 100}%`;
};

const showAlert = (
  summaryParsed: HostSummary,
  enqueueSnackbar: (
    message: SnackbarMessage,
    options?: OptionsObject | undefined
  ) => SnackbarKey
) => {
  if (summaryParsed.cpuUsage.alert)
    enqueueSnackbar(
      alertText(summaryParsed.id, "CPU usage", summaryParsed.cpuUsage.percent),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      { variant: AlertType[summaryParsed.cpuUsage.alertType] }
    );

  if (summaryParsed.diskUsage.alert)
    enqueueSnackbar(
      alertText(
        summaryParsed.id,
        "Disk usage",
        summaryParsed.diskUsage.percent
      ),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      { variant: AlertType[summaryParsed.diskUsage.alertType] }
    );

  if (summaryParsed.memoryUsage.alert)
    enqueueSnackbar(
      // eslint-disable-next-line prettier/prettier
      alertText(summaryParsed.id, "Memory usage", summaryParsed.memoryUsage.percent),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      { variant: AlertType[summaryParsed.memoryUsage.alertType] }
    );
};

const WebSocketProvider: React.FC = ({ children }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  const socket = new SockJS("http://localhost:8080/api/v2/ws");
  const stompClient = Stomp.over(socket);

  useEffect(() => {
    dispatch(updateHostsAsync()).then(() => {
      stompClient.connect({}, function () {
        stompClient.subscribe("/alerts", function (summary) {
          const summaryParsed: HostSummary = JSON.parse(summary.body);
          showAlert(summaryParsed, enqueueSnackbar);
          dispatch(updateSingleHost(summaryParsed));
        });
      });
    });
  }, []);

  return <>{children}</>;
};

export { WebSocketProvider };
