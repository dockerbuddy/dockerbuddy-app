import React from "react";
import {
  makeStyles,
  Card,
  CardHeader,
  CardContent,
  Typography,
} from "@material-ui/core";
import { extractMetric, humanFileSize } from "../../util/util";
import { Container } from "../../common/types";
import { MetricType } from "../../common/enums";

const useStyles = makeStyles((theme) => ({
  card: {
    borderColor: "#1A1C19",
    backgroundColor: "#16171B",
  },
  nameColor: {
    color: theme.palette.primary.main,
  },
}));

const ContainerCardComponent: React.FC<{ container: Container }> = (props) => {
  const classes = useStyles();

  const mem = extractMetric(props.container.metrics, MetricType.MEMORY_USAGE);
  const cpu = extractMetric(props.container.metrics, MetricType.CPU_USAGE);
  const name = props.container.name;

  return (
    <Card className={classes.card} variant="outlined">
      <CardHeader
        title={
          <Typography
            variant="subtitle1"
            style={{ display: "inline-block" }}
            className={classes.nameColor}
          >
            {name}
          </Typography>
        }
      />
      <CardContent>
        <Typography variant="subtitle2">
          {"MEM: " + humanFileSize(mem?.value)}
        </Typography>
        <Typography variant="subtitle2">{"CPU: " + cpu?.value}</Typography>
      </CardContent>
    </Card>
  );
};

export default ContainerCardComponent;
