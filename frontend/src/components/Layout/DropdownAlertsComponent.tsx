import React, { useEffect } from "react";
import { IconButton, Badge } from "@material-ui/core";
import { Notifications } from "@material-ui/icons";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  selectCounter,
  updateAlertCounterAsync,
} from "../../redux/alertCounterSlice";
import AlertsListComponent from "./AlertsListComponent";

const DropdownAlertsComponent: React.FC = () => {
  const counterData = useAppSelector(selectCounter);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(updateAlertCounterAsync());
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton aria-label="settings" onClick={handleClick}>
        <Badge
          color="secondary"
          badgeContent={counterData.value}
          overlap="circle"
          showZero
        >
          <Notifications color="primary" />
        </Badge>
      </IconButton>
      <AlertsListComponent
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
      />
    </>
  );
};

export default DropdownAlertsComponent;
