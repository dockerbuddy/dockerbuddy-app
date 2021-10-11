import { Card, CardContent, CardHeader, Typography } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { selectHost } from "../../hosts/hostsSlice";
import { useAppSelector } from "../../redux/hooks";
import InfluxHistory from "./InfluxHistory/InfluxHistory";

type HParam = { id: string };

const HostBoard: React.FC<RouteComponentProps<HParam>> = ({ match }) => {
  const hostId = parseInt(match.params.id);
  const hostData = useAppSelector(selectHost).hosts[hostId];

  return (
    <>
      {hostData !== undefined ? (
        <Card>
          <CardHeader
            title={
              <Typography variant="h6" style={{ display: "inline-block" }}>
                Host: {hostData.hostName}
              </Typography>
            }
          />
          <CardContent>
            <InfluxHistory hostId={hostId} />
          </CardContent>
        </Card>
      ) : (
        <Alert severity="error"> Host not found </Alert>
      )}
    </>
  );
};

export default HostBoard;
