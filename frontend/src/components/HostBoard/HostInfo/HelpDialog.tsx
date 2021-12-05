import { Dialog, DialogTitle } from "@material-ui/core";
import React from "react";
import BootstrapDialogTitle from "./BootStrapDialogTitle";

export interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
}

const HelpDialog: React.FC<SimpleDialogProps> = ({ onClose, open }) => {
  return (
    <Dialog onClose={onClose} open={open} fullWidth={true}>
      <BootstrapDialogTitle id="customized-dialog-title" onClose={onClose}>
        Modal title
      </BootstrapDialogTitle>
      <DialogTitle>Set backup account</DialogTitle>
    </Dialog>
  );
};

export default HelpDialog;
