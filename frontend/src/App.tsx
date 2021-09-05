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
import { Provider } from "react-redux";
import { store } from "./app/store";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <HostsDataProvider>
          <Provider store={store}>
            <WebSocketProvider>
              <SnackbarProvider
                maxSnack={4}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
              >
                <NotificationComponent>
                  <CssBaseline />
                  <Layout>
                    <Navigation />
                  </Layout>
                </NotificationComponent>
              </SnackbarProvider>
            </WebSocketProvider>
          </Provider>
        </HostsDataProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
