import React from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import { Box, Grid, Typography } from "@material-ui/core";

interface AddHostDialogProps {
  handleClose: () => void;
  isOpen: boolean;
}

const AddHostDialog: React.FC<AddHostDialogProps> = ({
  handleClose,
  isOpen,
}) => {
  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth={true}>
      <Box p={4}>
        <DialogTitle>
          <Box textAlign="center">
            <Typography variant="h4">Add new host</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid
            container
            direction="column"
            spacing={4}
            style={{ overflow: "hidden" }}
          >
            <Grid item>
              <TextField
                autoFocus
                id="ip"
                label="IP address"
                type="text"
                fullWidth={true}
              />
            </Grid>
            <Grid item>
              <TextField
                autoFocus
                id="hostName"
                label="Host name"
                type="text"
                fullWidth={true}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Box mt={3}>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  onClick={handleClose}
                  color="primary"
                  variant="outlined"
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item>
                <Button
                  onClick={handleClose}
                  color="primary"
                  variant="contained"
                >
                  Create
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default AddHostDialog;
