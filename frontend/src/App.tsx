import { CssBaseline, ThemeProvider } from "@material-ui/core";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import theme from "./common/theme";
import Layout from "./components/Layout/Layout";
import Navigation from "./components/Navigation/Navigation";
import { SnackbarProvider } from "notistack";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { WebSocketProvider } from "./hosts/WebSocket";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <WebSocketProvider>
            <SnackbarProvider
              maxSnack={4}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
            >
              <CssBaseline />
              <Layout>
                <Navigation />
              </Layout>
            </SnackbarProvider>
          </WebSocketProvider>
        </Provider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
