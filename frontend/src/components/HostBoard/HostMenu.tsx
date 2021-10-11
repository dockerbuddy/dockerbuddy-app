import { Menu, MenuItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { Edit, HighlightOff } from "@material-ui/icons";
import React from "react";

interface HostMenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  handleClose: () => void;
}

const HostMenu: React.FC<HostMenuProps> = ({ anchorEl, open, handleClose }) => {
  return (
    <Menu
      id="basic-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        "aria-labelledby": "basic-button",
      }}
    >
      <MenuItem onClick={handleClose}>
        <ListItemIcon>
          <Edit fontSize="small" />
        </ListItemIcon>
        <ListItemText>Edit host</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleClose}>
        <ListItemIcon>
          <HighlightOff fontSize="small" />
        </ListItemIcon>
        <ListItemText>Delete host</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default HostMenu;
