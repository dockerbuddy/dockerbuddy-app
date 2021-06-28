import { CssBaseline, ThemeProvider } from "@material-ui/core";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import theme from "./common/theme";
import Layout from "./components/Layout/Layout";
import Navigation from "./components/Navigation/Navigation";
import { HostsDataProvider } from "./context/HostContext";
import { WebSocketProvider } from "./context/WebSocket";
import NotificationComponent from "./components/Notifications/NotificationComponent";
import { SnackbarProvider } from "notistack";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <HostsDataProvider>
          <WebSocketProvider>
            <SnackbarProvider maxSnack={4}>
              <NotificationComponent>
                <CssBaseline />
                <Layout>
                  <Navigation />
                </Layout>
              </NotificationComponent>
            </SnackbarProvider>
          </WebSocketProvider>
        </HostsDataProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
