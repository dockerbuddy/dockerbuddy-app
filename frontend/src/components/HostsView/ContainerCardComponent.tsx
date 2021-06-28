import React from "react";
import {
  makeStyles,
  Card,
  CardHeader,
  CardContent,
  Typography,
} from "@material-ui/core";
import { humanFileSize } from "../../util/util";

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

  const mem = props.container.memory_usage._value;
  const cpu = props.container.cpu_percentage._value;
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
          {"MEM: " + humanFileSize(mem)}
        </Typography>
        <Typography variant="subtitle2">{"CPU: " + cpu}</Typography>
      </CardContent>
    </Card>
  );
};

export default ContainerCardComponent;
