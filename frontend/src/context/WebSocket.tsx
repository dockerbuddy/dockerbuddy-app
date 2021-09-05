import React from "react";
import { io, Socket } from "socket.io-client";

const webSocket: Socket = io("ws://localhost:8080/ws");
const WebSocketContext = React.createContext({ webSocket: webSocket });

const WebSocketProvider: React.FC = ({ children }) => {
  return (
    <WebSocketContext.Provider value={{ webSocket: webSocket }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export { WebSocketContext, WebSocketProvider };
