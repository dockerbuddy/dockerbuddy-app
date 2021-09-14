import { makeStyles, createStyles, Box, Toolbar } from "@material-ui/core";
import React from "react";
import Header from "./Header";
import PageWrapper from "./PageWrapper";

const useStyles = makeStyles((_theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      display: "flex",
    },
    content: {
      flexGrow: 1,
      padding: _theme.spacing(2),
    },
  })
);

const Layout: React.FC = ({ children }) => {
  const classes = useStyles();

  return (
    <PageWrapper>
      <Box className={classes.root}>
        <Header />
        <Box className={classes.content}>
          <Toolbar />
          {children}
        </Box>
      </Box>
    </PageWrapper>
  );
};

export default Layout;
