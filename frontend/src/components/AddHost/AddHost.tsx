/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@material-ui/core";
import { useForm } from "react-hook-form";
import { proxy } from "../../common/api";
import {
  StandardApiResponse,
  HostPercentRule,
  HostBasicRule,
} from "../../common/types";
import { Alert, AlertTitle } from "@material-ui/lab";
import { Link } from "react-router-dom";
import { useAppDispatch } from "../../redux/hooks";
import { updateHostsAsync } from "../../redux/hostsSlice";
import { RuleType } from "../../common/enums";
import { fromHumanFileSize } from "../../util/util";

export interface Rule {
  ruleType: RuleType;
  warnLevel: number;
  criticalLevel: number;
}

export interface AddHostFormData {
  hostName: string;
  ip: string;
  cpuWarn: string;
  cpuCrit: string;
  memWarn: string;
  memCrit: string;
  diskWarn: string;
  diskCrit: string;
  networkOutWarn: string;
  networkOutCrit: string;
  networkInWarn: string;
  networkInCrit: string;
}

interface AddHostProps {
  defaultData?: AddHostFormData;
  method?: string;
  editHostId?: string | null;
}

export interface PostHostResponse {
  id: string;
  hostName: string;
  ip: string;
  hostPercentRules: HostPercentRule[];
  hostBasicRules: HostBasicRule[];
}

const AddHost: React.FC<AddHostProps> = ({
  defaultData = {},
  method = "POST",
  editHostId = null,
}) => {
  const { register, errors, handleSubmit } = useForm<AddHostFormData>({
    defaultValues: defaultData,
  });
  const [error, setError] = useState<string>("");
  const [hostId, setHostId] = useState<string>("");
  const dispatch = useAppDispatch();

  const handleAdd = async (data: AddHostFormData) => {
    setError("");
    const cpuWarn = parseInt(data.cpuWarn);
    const cpuCrit = parseInt(data.cpuCrit);
    const memWarn = parseInt(data.memWarn);
    const memCrit = parseInt(data.memCrit);
    const diskWarn = parseInt(data.diskWarn);
    const diskCrit = parseInt(data.diskCrit);
    const networkOutWarn = fromHumanFileSize(
      parseFloat(data.networkOutWarn),
      "MB"
    );
    const networkOutCrit = fromHumanFileSize(
      parseFloat(data.networkOutCrit),
      "MB"
    );
    const networkInWarn = fromHumanFileSize(
      parseFloat(data.networkInWarn),
      "MB"
    );
    const networkInCrit = fromHumanFileSize(
      parseFloat(data.networkInCrit),
      "MB"
    );

    console.log("XD", networkInWarn);

    const hostPercentRules: HostPercentRule[] = [];
    const hostBasicRules: HostBasicRule[] = [];

    if (cpuWarn >= cpuCrit) {
      setError(
        "CPU usage warn threshold should be smaller than CPU usage critical threshold"
      );
      return;
    }

    if (memWarn >= memCrit) {
      setError(
        "Memory usage warn threshold should be smaller than memory usage critical threshold"
      );
      return;
    }

    if (diskWarn >= diskCrit) {
      setError(
        "Disk usage warn threshold should be smaller than disk usage critical threshold"
      );
      return;
    }

    if (networkOutWarn >= networkOutCrit) {
      setError(
        "Network out warn threshold should be smaller than network out critical threshold"
      );
      return;
    }

    if (networkInWarn >= networkInCrit) {
      setError(
        "Network in warn threshold should be smaller than network in critical threshold"
      );
      return;
    }
    if (!isNaN(cpuWarn) && !isNaN(cpuCrit))
      hostPercentRules.push({
        type: RuleType.CPU_USAGE,
        warnLevel: cpuWarn,
        criticalLevel: cpuCrit,
      });

    if (!isNaN(memWarn) && !isNaN(memCrit))
      hostPercentRules.push({
        type: RuleType.MEMORY_USAGE,
        warnLevel: memWarn,
        criticalLevel: memCrit,
      });

    if (!isNaN(diskWarn) && !isNaN(diskCrit))
      hostPercentRules.push({
        type: RuleType.DISK_USAGE,
        warnLevel: diskWarn,
        criticalLevel: diskCrit,
      });

    if (!isNaN(networkOutWarn) && !isNaN(networkOutCrit))
      hostBasicRules.push({
        type: RuleType.NETWORK_OUT,
        warnLevel: networkOutWarn,
        criticalLevel: networkOutCrit,
      });

    if (!isNaN(networkInWarn) && !isNaN(networkInCrit))
      hostBasicRules.push({
        type: RuleType.NETWORK_IN,
        warnLevel: networkInWarn,
        criticalLevel: networkInCrit,
      });

    const json = {
      hostName: data.hostName,
      ip: data.ip,
      hostPercentRules: hostPercentRules,
      hostBasicRules: hostBasicRules,
    };

    console.log(json);

    const url =
      method === "POST" ? `${proxy}/hosts` : `${proxy}/hosts/${editHostId}`;
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    });

    const result: StandardApiResponse<PostHostResponse> = await response.json();

    if (response.ok) {
      const hostResponse: PostHostResponse = result.body;
      setHostId(hostResponse.id.toString());
      dispatch(updateHostsAsync());
    } else {
      setError(result.message);
    }
  };

  return (
    <Container maxWidth="md">
      <Box textAlign="center" m={2}>
        <Typography variant="h4">
          {method === "PUT" ? "Edit" : "Add new"} host
        </Typography>
      </Box>
      <Box>
        <form onSubmit={handleSubmit(handleAdd)}>
          {hostId ? (
            <>
              <Alert severity="success">
                <AlertTitle>
                  Host {method === "PUT" ? "modified" : "added"}
                </AlertTitle>
                This is your unique host identifier: <strong>{hostId}</strong>
                <br />
                You will have to pass it in agent{"'"}s config
              </Alert>
              <Box textAlign="center" mt={3}>
                <Link to="/" style={{ textDecoration: "none" }}>
                  <Button variant="outlined" color="primary">
                    confirm
                  </Button>
                </Link>
              </Box>
            </>
          ) : (
            <Grid container item direction="column" spacing={4}>
              <Grid item>
                {error && <Alert severity="error">{error}</Alert>}
              </Grid>
              <Grid item>
                <TextField
                  name="ip"
                  label="IP Address"
                  variant="outlined"
                  fullWidth={true}
                  size="small"
                  inputRef={register({
                    required: "IP Address is required",
                    pattern: {
                      value:
                        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
                      message: "Invalid IP Address",
                    },
                  })}
                  error={!!errors.ip}
                  helperText={errors.ip?.message}
                />
              </Grid>
              <Grid item>
                <TextField
                  name="hostName"
                  label="Host Name"
                  variant="outlined"
                  fullWidth={true}
                  size="small"
                  inputRef={register({
                    required: "Host Name is required",
                  })}
                  error={!!errors.hostName}
                  helperText={errors.hostName?.message}
                />
              </Grid>
              <Grid item>
                <Typography variant="h6">CPU usage alerting</Typography>
                <TextField
                  name="cpuWarn"
                  label="Warn threshold"
                  size="small"
                  inputRef={register({
                    pattern: {
                      value: /^[1-9][0-9]?$|^100$/,
                      message: "Value should be in range from 0 to 100",
                    },
                  })}
                  error={!!errors.cpuWarn}
                  helperText={errors.cpuWarn?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                  style={{ marginRight: "40px" }}
                />
                <TextField
                  name="cpuCrit"
                  label="Critical threshold"
                  size="small"
                  inputRef={register({
                    pattern: {
                      value: /^[1-9][0-9]?$|^100$/,
                      message: "Value should be in range from 0 to 100",
                    },
                  })}
                  error={!!errors.cpuCrit}
                  helperText={errors.cpuCrit?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item>
                <Typography variant="h6">Memory usage alerting</Typography>
                <TextField
                  name="memWarn"
                  label="Warn threshold"
                  size="small"
                  inputRef={register({
                    pattern: {
                      value: /^[1-9][0-9]?$|^100$/,
                      message: "Value should be in range from 0 to 100",
                    },
                  })}
                  error={!!errors.memWarn}
                  helperText={errors.memWarn?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                  style={{ marginRight: "40px" }}
                />
                <TextField
                  name="memCrit"
                  label="Critical threshold"
                  size="small"
                  inputRef={register({
                    pattern: {
                      value: /^[1-9][0-9]?$|^100$/,
                      message: "Value should be in range from 0 to 100",
                    },
                  })}
                  error={!!errors.memCrit}
                  helperText={errors.memCrit?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item>
                <Typography variant="h6">Disk usage alerting</Typography>
                <TextField
                  name="diskWarn"
                  label="Warn threshold"
                  size="small"
                  inputRef={register({
                    pattern: {
                      value: /^[1-9][0-9]?$|^100$/,
                      message: "Value should be in range from 0 to 100",
                    },
                  })}
                  error={!!errors.diskWarn}
                  helperText={errors.diskWarn?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                  style={{ marginRight: "40px" }}
                />
                <TextField
                  name="diskCrit"
                  label="Critical threshold"
                  size="small"
                  inputRef={register({
                    pattern: {
                      value: /^[1-9][0-9]?$|^100$/,
                      message: "Value should be in range from 0 to 100",
                    },
                  })}
                  error={!!errors.diskCrit}
                  helperText={errors.diskCrit?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item>
                <Typography variant="h6">Network out alerting</Typography>
                <TextField
                  name="networkOutWarn"
                  label="Warn threshold"
                  size="small"
                  inputRef={register({
                    pattern: {
                      value: /^(?:[1-9]\d*|0)?(?:\.\d+)?$/,
                      message: "Value should a positive float",
                    },
                  })}
                  error={!!errors.networkOutWarn}
                  helperText={errors.networkOutWarn?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">MB</InputAdornment>
                    ),
                  }}
                  style={{ marginRight: "40px" }}
                />
                <TextField
                  name="networkOutCrit"
                  label="Critical threshold"
                  size="small"
                  inputRef={register({
                    pattern: {
                      value: /^(?:[1-9]\d*|0)?(?:\.\d+)?$/,
                      message: "Value should a positive float",
                    },
                  })}
                  error={!!errors.networkOutCrit}
                  helperText={errors.networkOutCrit?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">MB</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item>
                <Typography variant="h6">Network in alerting</Typography>
                <TextField
                  name="networkInWarn"
                  label="Warn threshold"
                  size="small"
                  inputRef={register({
                    pattern: {
                      value: /^(?:[1-9]\d*|0)?(?:\.\d+)?$/,
                      message: "Value should a positive float",
                    },
                  })}
                  error={!!errors.networkInWarn}
                  helperText={errors.networkInWarn?.message}
                  style={{ marginRight: "40px" }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">MB</InputAdornment>
                    ),
                  }}
                />
                <TextField
                  name="networkInCrit"
                  label="Critical threshold"
                  size="small"
                  inputRef={register({
                    pattern: {
                      value: /^(?:[1-9]\d*|0)?(?:\.\d+)?$/,
                      message: "Value should a positive float",
                    },
                  })}
                  error={!!errors.networkInCrit}
                  helperText={errors.networkInCrit?.message}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">MB</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disableElevation
                  fullWidth
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          )}
        </form>
      </Box>
    </Container>
  );
};

export default AddHost;
