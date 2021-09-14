import { Stomp } from "@stomp/stompjs";
import React, { useEffect } from "react";
import SockJS from "sockjs-client";
import { useAppDispatch } from "../redux/hooks";
import { updateHostsAsync, updateSingleHost } from "./hostsSlice";

const WebSocketProvider: React.FC = ({ children }) => {
  const dispatch = useAppDispatch();

  const socket = new SockJS("http://localhost:8080/api/v2/ws");
  const stompClient = Stomp.over(socket);

  useEffect(() => {
    dispatch(updateHostsAsync()).then(() => {
      stompClient.connect({}, function () {
        stompClient.subscribe("/alerts", function (greeting) {
          dispatch(updateSingleHost(JSON.parse(greeting.body)));
        });
      });
    });
  }, []);

  return <>{children}</>;
};

export { WebSocketProvider };
