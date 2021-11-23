/* eslint-disable @typescript-eslint/no-unused-vars */
import { Alert } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { BasicMetric } from "../../common/types";

interface NetworkInfoProps {
  networkIn: BasicMetric | undefined;
  networkOut: BasicMetric | undefined;
}

const NetworkInfo: React.FC<NetworkInfoProps> = ({ networkIn, networkOut }) => {
  return (
    <Box>
      {networkIn && networkOut ? (
        <Box>
          {networkIn.value} {networkOut.value}
        </Box>
      ) : (
        <Box>
          <Alert severity="error"> NO NETWORK INFO </Alert>
        </Box>
      )}
    </Box>
  );
};

export default NetworkInfo;
