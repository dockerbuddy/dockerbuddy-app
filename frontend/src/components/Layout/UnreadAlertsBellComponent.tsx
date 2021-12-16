import * as React from "react";
import IconButton from "@mui/material/IconButton";
import { Notifications } from "@material-ui/icons";
import AlertsListComponent from "./UnreadAlertsListComponent";
import {
  selectCounter,
  updateAlertCounterAsync,
} from "../../redux/alertCounterSlice";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { Badge } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(() => ({
  marginRight: {
    marginRight: "15px",
  },
}));

const UnreadAlertsBellComponent: React.FC = () => {
  const classes = useStyles();
  const counterData = useAppSelector(selectCounter);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const dispatch = useAppDispatch();
  React.useEffect(() => {
    dispatch(updateAlertCounterAsync());
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={classes.marginRight}>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls="long-menu"
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <Badge
          color="secondary"
          badgeContent={counterData.value}
          overlap="circle"
        >
          <Notifications color="primary" />
        </Badge>
      </IconButton>
      <AlertsListComponent
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
      />
    </div>
  );
};

export default UnreadAlertsBellComponent;
