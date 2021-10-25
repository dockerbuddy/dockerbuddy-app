import { Stomp } from "@stomp/stompjs";
import { useSnackbar } from "notistack";
import React, { useEffect } from "react";
import SockJS from "sockjs-client";
import { socketProxy } from "../common/api";
import { Alert, HostSummary } from "../common/types";
import { useAppDispatch } from "../redux/hooks";
import { updateHostsAsync, updateSingleHost } from "../redux/hostsSlice";

const WebSocketProvider: React.FC = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  const stompClient = Stomp.over(() => new SockJS(socketProxy));
  stompClient.connectionTimeout = 5000;

  useEffect(() => {
    dispatch(updateHostsAsync()).then(() => {
      stompClient.connect({}, function () {
        stompClient.subscribe("/metrics", (summary) => {
          const summaryParsed: HostSummary = JSON.parse(summary.body);
          dispatch(updateSingleHost(summaryParsed));
        });
        stompClient.subscribe("/alerts", (alert) => {
          const alertParsed: Alert = JSON.parse(alert.body);
          enqueueSnackbar(
            alertParsed.alertMessage,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            { variant: AlertType[alertParsed.alertType] }
          );
        });
      });
    });
  }, []);
  return <>{children}</>;
};

export default WebSocketProvider;
