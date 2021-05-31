import { createStyles, makeStyles } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((_theme) =>
  createStyles({
    pageWrapper: {
      height: "100vh",
      display: "flex",
      flexDirection: "column",
    },
  })
);

const PageWrapper: React.FC = ({ children }) => {
  const classes = useStyles();

  return <div className={classes.pageWrapper}>{children}</div>;
};

export default PageWrapper;
