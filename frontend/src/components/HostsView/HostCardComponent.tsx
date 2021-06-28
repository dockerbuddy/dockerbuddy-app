/* eslint-disable */
import React from "react";
import { makeStyles, Card, CardHeader, Typography, IconButton } from "@material-ui/core";
import SettingsIcon from '@material-ui/icons/Settings';

const useStyles = makeStyles((theme) => ({
  card: {
    borderColor: "#1A1C19",
    backgroundColor: "#1D1F22",
  },
  settingsColor: {
    color: theme.palette.primary.main,
  },
  nameColor: {
    color: "rgba(229, 209, 208,1)",
  }

}));

const HostCardComponent: React.FC<HostData> = ({ ip, name }) => {
  const classes = useStyles();
  const whitespace = " ";

  return (
    <Card className={classes.card} variant="outlined">
      <CardHeader
        title={ 
          <>
            <Typography variant="h6" style={{display: 'inline-block'}} className={classes.nameColor}>{name}</Typography>
            <Typography variant= "h6" style={{display: 'inline-block'}}>{": " +ip}</Typography>
          </>
        }
        action={
          <IconButton aria-label="settings" className={classes.settingsColor}>
            <SettingsIcon />
          </IconButton>
        }
      />
    </Card>
  );
};

export default HostCardComponent;
