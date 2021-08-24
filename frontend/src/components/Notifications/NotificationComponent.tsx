import React, { useContext, useEffect } from "react";
import { WebSocketContext } from "../../context/WebSocket";
import { useSnackbar } from "notistack";

const NotificationComponent: React.FC = ({ children }) => {
  const { webSocket } = useContext(WebSocketContext);

  useEffect(() => {
    webSocket.on("notification", (data) => {
      const map = {
        ok: "success",
        warn: "warning",
        crit: "error",
      };
      console.log(data);
      const messageArray = data._message.split(";");
      messageArray[1] =
        messageArray[1] === "virtual_memory"
          ? "virtual memory"
          : messageArray[1];
      console.log(messageArray);
      enqueueSnackbar(
        `${messageArray[0]} ${messageArray[1]} is ${messageArray[3]}%`,
        {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore: Unreachable code error
          variant: map[data._level],
        }
      );
    });
  }, [webSocket]);

  const { enqueueSnackbar } = useSnackbar();

  return <>{children}</>;
};

export default NotificationComponent;
