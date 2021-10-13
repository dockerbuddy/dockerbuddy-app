/* eslint-disable */
import { Box, Button, Grid, TextField, Typography } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import React, { useState } from "react";
import { proxy } from "../../common/api";
import { StandardApiResponse } from "../../common/types";
import { selectHost } from "../../hosts/hostsSlice";
import { useAppSelector } from "../../redux/hooks";
import { ContainersInfo } from "./AddHost";

const AddContainerRules: React.FC<{
  info: ContainersInfo | undefined;
  hostId: string;
}> = (props) => {
  const info = props.info;
  const hostInfo = useAppSelector(selectHost).hosts[Number.parseInt(props.hostId)];

  const [at, setAt] = useState<string>("");
  const [cn, setCn] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [type, setType] = useState<string>("");

  const handleAddRule = async () => {
    const json = {
      hostName: hostInfo.hostName,
      ip: hostInfo.ip,
      containerRules: [
        {
          alertType: at,
          containerName: cn,
          id: id,
          type: type,
        }
      ],
    };

    const response = await fetch(`${proxy}/hosts/${props.hostId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json)
    });

    const result: StandardApiResponse = await response.json();

    if (response.ok) {
      console.log(result);
    } else {
      console.log(result);
    }
  }

  return (
    <>
      <Box textAlign="center" m={2}>
        <Typography variant="h6">Add new container rules</Typography>
      </Box>
      <Box>
        {info?.containers === undefined &&
        info?.containersRules === undefined ? (
          <Alert severity="info">
            <AlertTitle>No containers found</AlertTitle>
            Need to first fetch containers info from host.
          </Alert>
        ) : (
          <Grid container item spacing={4}>
            <Grid item>
              <TextField
                label="Alert Type"
                onChange={(t) => setAt(t.target.value)}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Container Name"
                onChange={(t) => setCn(t.target.value)}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Container Id"
                onChange={(t) => setId(t.target.value)}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Type"
                onChange={(t) => setType(t.target.value)}
              />
            </Grid>
            <Grid item>
              <Button
                onClick={handleAddRule}
              >
                Add rule
              </Button>
            </Grid>
          </Grid>
        )}
      </Box>
    </>
  );
};

export default AddContainerRules;
