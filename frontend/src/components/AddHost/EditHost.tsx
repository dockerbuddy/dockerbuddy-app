import { Box, CircularProgress } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { RouteComponentProps } from "react-router-dom";
import { proxy } from "../../common/api";
import { RuleType } from "../../common/enums";
import {
  HostBasicRule,
  HostPercentRule,
  StandardApiResponse,
} from "../../common/types";
import { humanFileSizeSimple } from "../../common/util";
import AddHost, { AddHostFormData, PostHostResponse } from "./AddHost";

type HParam = { id: string };

const EditHost: React.FC<RouteComponentProps<HParam>> = ({ match }) => {
  const hostId = match.params.id;
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

    const json: StandardApiResponse<PostHostResponse> = await response.json();
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
      networkOutCrit: "",
      networkOutWarn: "",
      networkInWarn: "",
      networkInCrit: "",
    };

    jsonBody.hostPercentRules.forEach((rule: HostPercentRule) => {
      if (rule.type === RuleType.CPU_USAGE)
        res = {
          ...res,
          cpuWarn: rule.warnLevel.toString(),
          cpuCrit: rule.criticalLevel.toString(),
        };

      if (rule.type === RuleType.MEMORY_USAGE)
        res = {
          ...res,
          memWarn: rule.warnLevel.toString(),
          memCrit: rule.criticalLevel.toString(),
        };

      if (rule.type === RuleType.DISK_USAGE)
        res = {
          ...res,
          diskWarn: rule.warnLevel.toString(),
          diskCrit: rule.criticalLevel.toString(),
        };
    });

    jsonBody.hostBasicRules.forEach((rule: HostBasicRule) => {
      if (rule.type === RuleType.NETWORK_IN)
        res = {
          ...res,
          networkInWarn: humanFileSizeSimple(rule.warnLevel),
          networkInCrit: humanFileSizeSimple(rule.criticalLevel),
        };

      if (rule.type === RuleType.NETWORK_OUT)
        res = {
          ...res,
          networkOutWarn: humanFileSizeSimple(rule.warnLevel),
          networkOutCrit: humanFileSizeSimple(rule.criticalLevel),
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
