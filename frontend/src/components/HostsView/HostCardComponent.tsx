/* eslint-disable */
import React from "react";
import { makeStyles, Card } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  blue: {
    borderColor: "#1A1C19",
    backgroundColor: "#1D1F22",
  },
}));

const HostCardComponent: React.FC<HostData> = ({ ip, name }) => {
  const classes = useStyles();

  return (
    <Card className={classes.blue} variant="outlined">
      <p>{name} {ip}</p>
    </Card>
  );
};

export default HostCardComponent;
