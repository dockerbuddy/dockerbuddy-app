import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  makeStyles,
  MenuItem,
  TextField,
  Typography,
} from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";
import React, { useEffect, useState } from "react";
import { proxy } from "../../common/api";
import { ContainerRule, ContainerSummary, RuleType } from "../../common/types";
import ContainerRuleCard from "./ContainerRuleCard";
import { Add } from "@material-ui/icons";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { selectHost, updateHostsAsync } from "../../hosts/hostsSlice";

interface ContainersInfo {
  containersRules: ContainerRule[];
  containers: ContainerSummary[];
}

const useStyles = makeStyles(() => ({
  flex: {
    display: "flex",
  },
  margin: {
    margin: "10px 0px",
  },
}));

const alertTypes = [
  {
    value: "WARN",
    name: "Warning",
  },
  {
    value: "CRITICAL",
    name: "Error",
  },
];

const ruleTypes: RuleType[] = [
  RuleType.CONTAINER_STATE,
  RuleType.CPU_USAGE,
  RuleType.DISK_USAGE,
  RuleType.MEMORY_USAGE,
];

const AddContainerRules: React.FC<{
  hostId: string;
}> = (props) => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const hostsData = useAppSelector(selectHost).hosts;

  const [sName, setSName] = useState<string>("");
  const [sAlertType, setSAlertType] = useState<string>("CRITICAL");
  const [sRuleType, setSRuleType] = useState<string>("ContainerState");
  const [info, setInfo] = useState<ContainersInfo>();

  useEffect(() => {
    const host = hostsData[Number.parseInt(props.hostId)];
    const containersRules = host?.containersRules;
    const containers = host?.hostSummary?.containers;
    setInfo({ containersRules, containers });
  }, [hostsData]);

  const handleAddRule = async () => {
    const json = {
      ...hostsData[Number.parseInt(props.hostId)],
      containersRules: [
        ...hostsData[Number.parseInt(props.hostId)].containersRules,
        {
          alertType: sAlertType,
          containerName: sName,
          type: sRuleType,
        },
      ],
    };

    const response = await fetch(`${proxy}/hosts/${props.hostId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    });

    if (response.ok) {
      dispatch(updateHostsAsync());
    } else {
      //todo do something
    }
  };

  const handleRemoveRule = async (rule: ContainerRule) => {
    const json = { ...hostsData[Number.parseInt(props.hostId)] };
    json.containersRules = json.containersRules.filter(
      (r) => JSON.stringify(r) !== JSON.stringify(rule)
    );

    const response = await fetch(`${proxy}/hosts/${props.hostId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(json),
    });

    if (response.ok) {
      dispatch(updateHostsAsync());
    } else {
      //todo do something
    }
  };

  return (
    <>
      <Box textAlign="center" m={2}>
        <Typography variant="h6">Add new container rules</Typography>
      </Box>
      <Box>
        {info?.containers === undefined ||
        info?.containersRules === undefined ? (
          <Alert severity="info">
            <AlertTitle>No containers found</AlertTitle>
            Need to first fetch containers info from host.
          </Alert>
        ) : (
          <>
            <Card>
              <CardContent className={classes.flex}>
                <Grid container spacing={4}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      id="container-name"
                      select
                      label="Container"
                      value={sName}
                      onChange={(t) => setSName(t.target.value)}
                    >
                      {info && info.containers ? (
                        Object.values(info.containers).map(
                          (c: ContainerSummary) => (
                            <MenuItem key={c.name} value={c.name}>
                              {c.name}
                            </MenuItem>
                          )
                        )
                      ) : (
                        <MenuItem key={"no-containers"} value={""}>
                          No containers found.
                        </MenuItem>
                      )}
                    </TextField>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      id="rule-type"
                      select
                      label="Rule type"
                      value={sRuleType}
                      onChange={(t) => setSRuleType(t.target.value)}
                    >
                      {Object.values(ruleTypes).map((rType: RuleType) => (
                        <MenuItem key={rType} value={rType}>
                          {rType}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      fullWidth
                      id="alert-type"
                      select
                      label="Alert type"
                      value={sAlertType}
                      onChange={(t) => setSAlertType(t.target.value)}
                    >
                      {Object.values(alertTypes).map((aType) => (
                        <MenuItem key={aType.value} value={aType.value}>
                          {aType.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
                <IconButton
                  aria-label="add"
                  color="primary"
                  edge="end"
                  disabled={sName == ""}
                  onClick={handleAddRule}
                >
                  <Add />
                </IconButton>
              </CardContent>
            </Card>

            <Divider className={classes.margin} />

            {Object.values(info.containersRules).map((rule) => (
              <ContainerRuleCard
                key={rule.id}
                rule={rule}
                onRemove={handleRemoveRule}
              />
            ))}
          </>
        )}
      </Box>
    </>
  );
};

export default AddContainerRules;
