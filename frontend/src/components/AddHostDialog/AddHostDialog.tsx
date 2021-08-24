import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Alert, AlertTitle } from "@material-ui/lab";
import TextField from "@material-ui/core/TextField";
import { Box, Grid, Typography } from "@material-ui/core";
import { proxy } from "../../common/api";
import { capitalizeFirstLetter } from "../../util/util";
import RangePicker from "./RangePicker";

interface AddHostDialogProps {
  onClose: () => void;
  isOpen: boolean;
}

interface FormData {
  bucket_name: string;
  ip_address: string;
}

const AddHostDialog: React.FC<AddHostDialogProps> = ({ onClose, isOpen }) => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formErros, setFormErros] = useState<FormData>({
    bucket_name: "",
    ip_address: "",
  });

  const [virtualRange, setVirtualRange] = useState([50, 80]);
  const [diskRange, setDiskRange] = useState([50, 80]);

  const [formData, setFormData] = useState<FormData>({
    bucket_name: "",
    ip_address: "",
  });

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    let isError = false;
    if (formData.bucket_name === "") {
      setFormErros((prev) => ({
        ...prev,
        bucket_name: "Host name is required",
      }));
      isError = true;
    }

    if (/\s/g.test(formData.bucket_name)) {
      setFormErros((prev) => ({
        ...prev,
        bucket_name: "White space is not allowed in the name",
      }));
      isError = true;
    }

    if (formData.ip_address === "") {
      setFormErros((prev) => ({
        ...prev,
        ip_address: "IP address is required",
      }));
      isError = true;
    }

    if (!/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(formData.ip_address)) {
      setFormErros((prev) => ({
        ...prev,
        ip_address: "IP address is incorrect",
      }));
      isError = true;
    }

    if (isError) return;

    //TODO TYPE THE RESPONSE!
    console.log({
      ...formData,
      disk_range: {
        min: diskRange[0],
        max: diskRange[1],
      },
      virtual_range: {
        min: virtualRange[0],
        max: virtualRange[1],
      },
    });
    const response = await fetch(`${proxy}/hosts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        disk_range: {
          min: diskRange[0],
          max: diskRange[1],
        },
        virtual_range: {
          min: virtualRange[0],
          max: virtualRange[1],
        },
      }),
    });

    const result = await response.json();
    if (!response.ok) {
      setError(result.bucket.message);
    } else {
      setSuccess(`Token: ${result.access_token};Bucket: ${result.bucket.name}`);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [event.target.id]: event.target.value,
    }));

    setFormErros((prev) => ({
      ...prev,
      [event.target.id]: "",
    }));
  };

  const handleClose = async () => {
    console.log("asdasd");
    onClose();
    setFormData({
      bucket_name: "",
      ip_address: "",
    });

    setFormErros({
      bucket_name: "",
      ip_address: "",
    });

    setError("");
    setSuccess("");
  };

  const [token, bucket] = success.split(";");

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth={true}>
      <form onSubmit={handleSubmit}>
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
                    <AlertTitle>Agent settings:</AlertTitle>
                    {token}
                    <br />
                    {bucket}
                  </Alert>
                </Grid>
              )}
              {!success && (
                <>
                  <Grid item>
                    <TextField
                      id="ip_address"
                      name="ip_address"
                      autoFocus
                      label="IP Address"
                      type="text"
                      variant="outlined"
                      fullWidth={true}
                      autoComplete="off"
                      value={formData.ip_address}
                      onChange={handleChange}
                      error={!!formErros.ip_address}
                      helperText={formErros.ip_address}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      id="bucket_name"
                      name="bucket_name"
                      autoFocus
                      label="Host name"
                      type="text"
                      variant="outlined"
                      autoComplete="off"
                      fullWidth={true}
                      value={formData.bucket_name}
                      onChange={handleChange}
                      error={!!formErros.bucket_name}
                      helperText={formErros.bucket_name}
                    />
                  </Grid>
                  <Grid item>
                    <RangePicker
                      virtualRange={virtualRange}
                      setVirtualRange={setVirtualRange}
                      diskRange={diskRange}
                      setDiskRange={setDiskRange}
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
                  <Button
                    onClick={handleClose}
                    color="primary"
                    variant="outlined"
                  >
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
