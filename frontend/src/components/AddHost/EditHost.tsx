/* eslint-disable */
import { Box, CircularProgress } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { proxy } from "../../common/api";
import {
  AddHostFormData,
  PostHostResponse,
  Rule,
  StandardApiResponse,
} from "../../common/types";
import AddHost from "./AddHost";

type HParam = { id: string };

const EditHost: React.FC<RouteComponentProps<HParam>> = ({ match }) => {
  const hostId = parseInt(match.params.id);
  const [formData, setFormData] = useState<AddHostFormData | null>(null);

  const getHostSettings = async () => {
    const response: Response = await fetch(`${proxy}/hosts/${hostId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return;
    }

    const json: StandardApiResponse = await response.json();
    const jsonBody: PostHostResponse = json.body;

    let res: AddHostFormData = {
      hostName: jsonBody.hostName,
      ip: jsonBody.ip,
      cpuWarn: "",
      cpuCrit: "",
      memWarn: "",
      memCrit: "",
      diskWarn: "",
      diskCrit: "",
    };

    jsonBody.hostRules.forEach((rule: Rule) => {
      console.log(rule.type);
      if (rule.type === "CpuUsage")
        res = {
          ...res,
          cpuWarn: rule.warnLevel.toString(),
          cpuCrit: rule.criticalLevel.toString(),
        };

      if (rule.type === "MemoryUsage")
        res = {
          ...res,
          memWarn: rule.warnLevel.toString(),
          memCrit: rule.criticalLevel.toString(),
        };

      if (rule.type === "DiskUsage")
        res = {
          ...res,
          diskWarn: rule.warnLevel.toString(),
          diskCrit: rule.criticalLevel.toString(),
        };
    });
    setFormData(res);
  };

  useEffect(() => {
    getHostSettings();
  }, []);

  return (
    <Box>
      {formData != null ? (
        <AddHost defaultData={formData} method={"PUT"} editHostId={hostId} />
      ) : (
        <Box justifyContent="center" display="flex" mt={5}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default EditHost;
