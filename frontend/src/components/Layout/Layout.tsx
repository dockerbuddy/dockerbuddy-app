import { makeStyles, createStyles, Box, Toolbar } from "@material-ui/core";
import React from "react";
import HostsSidebar from "../HostsSidebar/HostsSidebar";
import Footer from "./Footer";
import Header from "./Header";
import PageWrapper from "./PageWrapper";

const useStyles = makeStyles((_theme) =>
  createStyles({
    root: {
      flexGrow: 1, //TODO remove after footer placement fix
      display: "flex",
    },
    content: {
      flexGrow: 1,
    },
  })
);

const Layout: React.FC = ({ children }) => {
  const classes = useStyles();

  return (
    <PageWrapper>
      <Box className={classes.root}>
        <Header />
        <HostsSidebar />
        <Box className={classes.content}>
          <Toolbar />
          {children}
        </Box>
      </Box>
      <Footer />
    </PageWrapper>
  );
};

export default Layout;
