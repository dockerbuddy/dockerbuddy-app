/* eslint-disable */
import React, { useContext, useEffect } from "react";
import { WebSocketContext } from "../../context/WebSocket";
// import { useSnackbar } from "notistack";
import { useAppDispatch } from "../../app/hooks";
import { updateSingleHost } from "../../hosts/hostsSlice";

const NotificationComponent: React.FC = ({ children }) => {
  const { webSocket } = useContext(WebSocketContext);

  const dispatch = useAppDispatch();

  // useEffect(() => {
  //   webSocket.on("ws", (data) => {
  //     dispatch(updateSingleHost(data));
  //   });
  // }, [webSocket]);

  return <>{children}</>;
};

export default NotificationComponent;
