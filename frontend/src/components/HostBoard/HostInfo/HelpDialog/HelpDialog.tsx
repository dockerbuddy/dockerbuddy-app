/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Box,
  Dialog,
  DialogContent,
  Grid,
  Typography,
} from "@material-ui/core";
import React from "react";
import ContainerCardComponent from "../ContainerCardComponent";
import BootstrapDialogTitle from "./BootstrapDialogTitle";
import { cont1, cont2, cont3, cont4 } from "./mockContainers";
import { Visibility } from "@material-ui/icons";

export interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
}

const HelpDialog: React.FC<SimpleDialogProps> = ({ onClose, open }) => {
  return (
    <Dialog onClose={onClose} open={open} fullWidth={true} maxWidth="md">
      <BootstrapDialogTitle id="customized-dialog-title" onClose={onClose}>
        Containers guide
      </BootstrapDialogTitle>
      <DialogContent>
        <Box textAlign="justify" mb={4}>
          With DockerBuddy you can monitor state of containers on your machine.
          When new container appears, it is marked until you view it. You can
          start monitoring container by clicking <Visibility fontSize="small" />{" "}
          icon. When monitored container change its state to exited, you will
          receive an alert and container will its color.
        </Box>
        <Grid container direction="row" spacing={2}>
          <Grid item xs={4}>
            <Box textAlign="center" mb={2}>
              <Typography variant="h6">New container</Typography>
            </Box>
            {/*@ts-ignore*/}
            <ContainerCardComponent hostId="" mock={true} container={cont1} />
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center" mb={2}>
              <Typography variant="h6">Not monitored container</Typography>
            </Box>
            {/*@ts-ignore*/}
            <ContainerCardComponent hostId="" mock={true} container={cont3} />
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center" mb={2}>
              <Typography variant="h6">Monitored running container</Typography>
            </Box>
            {/*@ts-ignore*/}
            <ContainerCardComponent hostId="" mock={true} container={cont2} />
          </Grid>
          <Grid item xs={4}></Grid>
          <Grid item xs={4}>
            <Box textAlign="center" mb={2}>
              <Typography variant="h6">
                Monitored not running container
              </Typography>
            </Box>
            {/*@ts-ignore*/}
            <ContainerCardComponent hostId="" mock={true} container={cont4} />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
