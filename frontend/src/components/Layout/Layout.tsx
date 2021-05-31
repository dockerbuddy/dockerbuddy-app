import { makeStyles, createStyles, Box } from "@material-ui/core";
import React from "react";
import Footer from "./Footer";
import Header from "./Header";
import PageWrapper from "./PageWrapper";

const useStyles = makeStyles((_theme) =>
  createStyles({
    content: {
      flexGrow: 1,
    },
  })
);

const Layout: React.FC = ({ children }) => {
  const classes = useStyles();

  return (
    <PageWrapper>
      <Box className={classes.content}>
        <Header />
        {children}
      </Box>
      <Footer />
    </PageWrapper>
  );
};

export default Layout;
