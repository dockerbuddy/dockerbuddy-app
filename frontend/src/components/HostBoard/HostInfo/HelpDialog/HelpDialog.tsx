import { Dialog, DialogContent } from "@material-ui/core";
import React from "react";
import ContainerCardComponent from "../../../Dashboard/ContainerCardComponent";
import BootstrapDialogTitle from "./BootstrapDialogTitle";
import { cont1 } from "./mockContainers";

export interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
}

const HelpDialog: React.FC<SimpleDialogProps> = ({ onClose, open }) => {
  return (
    <Dialog onClose={onClose} open={open} fullWidth={true}>
      <BootstrapDialogTitle id="customized-dialog-title" onClose={onClose}>
        Containers helper
      </BootstrapDialogTitle>
      <DialogContent>
        {/* // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore*/}
        <ContainerCardComponent hostId="XD" mock={true} container={cont1} />
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
