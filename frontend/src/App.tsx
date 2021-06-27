import { CssBaseline, ThemeProvider } from "@material-ui/core";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import theme from "./common/theme";
import Layout from "./components/Layout/Layout";
import Navigation from "./components/Navigation/Navigation";
import { WebSocketProvider } from "./context/WebSocket";
import NotificationComponent from "./components/Notifications/NotificationComponent";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <WebSocketProvider>
          <NotificationComponent>
            <CssBaseline />
            <Layout>
              <Navigation />
            </Layout>
          </NotificationComponent>
        </WebSocketProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
