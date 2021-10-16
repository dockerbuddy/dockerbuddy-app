/* eslint-disable @typescript-eslint/no-unused-vars */
import { Stomp } from "@stomp/stompjs";
import { useSnackbar } from "notistack";
import React, { useEffect } from "react";
import SockJS from "sockjs-client";
import { socketProxy } from "../common/api";
import { HostSummary } from "../common/types";
import { useAppDispatch } from "../redux/hooks";
import { showAlert } from "../util/alerts";
import { updateHostsAsync, updateSingleHost } from "./hostsSlice";

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
          console.log(summaryParsed);
          // showAlert(summaryParsed, enqueueSnackbar);
          // dispatch(updateSingleHost(summaryParsed));
        });
        stompClient.subscribe("/alerts", (alert) => {
          console.log(alert);
        });
      });
    });
  }, []);

  return <>{children}</>;
};

export { WebSocketProvider };
