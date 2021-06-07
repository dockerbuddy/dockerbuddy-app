/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Alert, AlertTitle } from "@material-ui/lab";
import TextField from "@material-ui/core/TextField";
import { Box, Grid, Typography } from "@material-ui/core";
import { useForm } from "react-hook-form";
import { proxy } from "../../common/api";
import { capitalizeFirstLetter } from "../../util/util";

interface AddHostDialogProps {
  handleClose: () => void;
  isOpen: boolean;
}

interface AddHostFormData {
  bucket_name: string;
  ip_address: string;
}

const AddHostDialog: React.FC<AddHostDialogProps> = ({
  handleClose,
  isOpen,
}) => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddHostFormData>();

  const onSubmit = async (data: AddHostFormData) => {
    setError("");
    setSuccess("");
    console.log(data);
    const response = await fetch(`${proxy}/buckets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const result = await response.json();
      setError(result.bucket.message);
    } else {
      const result = await response.json();
      setSuccess(result.access_token);
    }
  };

  const onClose = () => {
    handleClose();
    setError("");
    setSuccess("");
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth={true}>
      <form onSubmit={handleSubmit(onSubmit)}>
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
              {error && (
                <Grid item>
                  <Alert severity="error">{capitalizeFirstLetter(error)}</Alert>
                </Grid>
              )}
              {success && (
                <Grid item>
                  <Alert severity="success">
                    <AlertTitle>Agent token:</AlertTitle>
                    {capitalizeFirstLetter(success)}
                  </Alert>
                </Grid>
              )}
              {!success && (
                <>
                  <Grid item>
                    <TextField
                      id="ip_address"
                      autoFocus
                      label="IP Address "
                      type="text"
                      variant="outlined"
                      fullWidth={true}
                      {...register("ip_address", {
                        required: true,
                        pattern: {
                          value: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/,
                          message: "Provided IP Address is incorrect",
                        },
                      })}
                      error={!!errors.ip_address}
                      helperText={errors.ip_address?.message}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      id="bucket_name"
                      autoFocus
                      label="Host name"
                      type="text"
                      variant="outlined"
                      fullWidth={true}
                      {...register("bucket_name", {
                        required: true,
                      })}
                      error={!!errors.bucket_name}
                      helperText={errors.bucket_name?.message}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Box mt={3}>
              <Grid container spacing={2}>
                <Grid item>
                  <Button onClick={onClose} color="primary" variant="outlined">
                    Exit
                  </Button>
                </Grid>
                {!success && (
                  <Grid item>
                    <Button type="submit" color="primary" variant="contained">
                      Create
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Box>
          </DialogActions>
        </Box>
      </form>
    </Dialog>
  );
};

export default AddHostDialog;
