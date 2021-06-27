/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React, { useContext, useEffect } from "react";
import { WebSocketContext } from "../../context/WebSocket";

const NotificationComponent = ({ children }) => {
  const { webSocket } = useContext(WebSocketContext);
  useEffect(() => {
    webSocket.on("notification", (data) => {
      console.log(data);
    });
  }, [webSocket]);

  return <div>{children}</div>;
};

export default NotificationComponent;
