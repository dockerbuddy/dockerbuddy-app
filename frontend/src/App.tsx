import { CssBaseline, ThemeProvider } from "@material-ui/core";
import React from "react";
import { BrowserRouter } from "react-router-dom";
import theme from "./common/theme";
import Layout from "./components/Layout/Layout";
import Navigation from "./components/Navigation/Navigation";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout>
          <Navigation />
        </Layout>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
