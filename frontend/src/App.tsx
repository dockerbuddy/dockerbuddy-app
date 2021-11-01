import { CssBaseline, ThemeProvider } from "@material-ui/core";
import { ThemeProvider as ThemeProviderMui } from "@mui/material";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import theme from "./common/theme";
import Layout from "./components/Layout/Layout";
import Navigation from "./components/Navigation/Navigation";
import { SnackbarProvider } from "notistack";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import WebSocketProvider from "./hosts/WebSocket";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <ThemeProviderMui theme={theme}>
          <Provider store={store}>
            <SnackbarProvider
              maxSnack={4}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
            >
              <WebSocketProvider>
                <CssBaseline />
                <Layout>
                  <Navigation />
                </Layout>
              </WebSocketProvider>
            </SnackbarProvider>
          </Provider>
        </ThemeProviderMui>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
