/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import { makeStyles, Box, Typography, Drawer } from "@material-ui/core";
import { proxy } from "../../common/api";

const useStyles = makeStyles((theme) => ({
  sideBar: {
    backgroundColor: "rgba(60,61,65,0.37)",
    height: "90vh",
    width: "20vw",
  },
}));

const HostsDisplay: React.FC = () => {
  const [hosts, setHosts] = useState([]);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const classes = useStyles();

  useEffect(() => {
    fetch(`${proxy}/hosts`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) return response.json();
        else {
          setIsLoading(false);
          setError(true);
          throw new Error(`Response code is ${response.status}`);
        }
      })
      .then((json) => {
        setHosts(hosts);
        setIsLoading(false);
      })
      .catch((e) => console.log(e));
  }, []);

  console.log(hosts);

  return (
    <Box className={classes.sideBar} p={4}>
      <Typography variant="h4" color="primary">
        HOSTY
      </Typography>
    </Box>
  );
};

export default HostsDisplay;
