import { Stomp } from "@stomp/stompjs";
import { useSnackbar } from "notistack";
import React, { useEffect } from "react";
import SockJS from "sockjs-client";
import { HostSummary } from "../common/types";
import { useAppDispatch } from "../redux/hooks";
import { showAlert } from "../util/alerts";
import { updateHostsAsync, updateSingleHost } from "./hostsSlice";

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
