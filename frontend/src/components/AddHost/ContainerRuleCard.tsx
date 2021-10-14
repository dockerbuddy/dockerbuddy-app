import {
  Card,
  CardContent,
  Grid,
  IconButton,
  makeStyles,
  TextField,
} from "@material-ui/core";
import React from "react";
import { ContainerRule } from "../../common/types";
import { Clear } from "@material-ui/icons";

const useStyles = makeStyles(() => ({
  flex: {
    display: "flex",
  },
}));

const ContainerRuleCard: React.FC<{
  rule: ContainerRule;
  onRemove: (rule: ContainerRule) => Promise<void>;
}> = (props) => {
  const classes = useStyles();
  const rule = props.rule;

  const handleButton = () => {
    props.onRemove(props.rule);
  };

  return (
    <Grid item xs={12}>
      <Card>
        <CardContent className={classes.flex}>
          <Grid container spacing={4}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                disabled
                id="container-name"
                label="Container"
                value={rule.containerName}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                disabled
                id="rule-type"
                label="Rule type"
                value={rule.type}
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                fullWidth
                disabled
                id="alert-type"
                label="Alert type"
                value={rule.alertType}
              />
            </Grid>
          </Grid>
          <IconButton
            aria-label="add"
            color="secondary"
            edge="end"
            onClick={handleButton}
          >
            <Clear />
          </IconButton>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default ContainerRuleCard;
