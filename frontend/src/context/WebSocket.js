/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
//TODO swtich to TypeScript and provide Typing :<
import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const webSocket = io("ws://localhost:5000");
const WebSocketContext = React.createContext({ webSocket: webSocket });

const WebSocketProvider = ({ children }) => {
  return (
    <WebSocketContext.Provider value={{ webSocket: webSocket }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export { WebSocketContext, WebSocketProvider };
