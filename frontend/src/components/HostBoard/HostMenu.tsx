import { Menu, MenuItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { Edit, HighlightOff } from "@material-ui/icons";
import React from "react";
import { proxy } from "../../common/api";
import { Link, useHistory } from "react-router-dom";

interface HostMenuProps {
  anchorEl: null | HTMLElement;
  open: boolean;
  handleClose: () => void;
  hostId: string;
}

const HostMenu: React.FC<HostMenuProps> = ({
  anchorEl,
  open,
  handleClose,
  hostId,
}) => {
  const history = useHistory();
  const deleteHost = async () => {
    const response: Response = await fetch(`${proxy}/hosts/${hostId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      //todo DO SOMETHING
      return;
    }

    history.push("/");
  };

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
      <Link
        to={`/host/${hostId}/edit`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <MenuItem>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit host</ListItemText>
        </MenuItem>
      </Link>
      <MenuItem onClick={deleteHost}>
        <ListItemIcon>
          <HighlightOff fontSize="small" />
        </ListItemIcon>
        <ListItemText>Delete host</ListItemText>
      </MenuItem>
    </Menu>
  );
};

export default HostMenu;
