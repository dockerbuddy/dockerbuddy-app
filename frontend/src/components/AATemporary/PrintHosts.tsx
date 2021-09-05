import React from "react";

import { useAppDispatch } from "../../app/hooks";
import { updateHostsAsync } from "../../hosts/hostsSlice";

const PrintHosts: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <div>
      <button onClick={() => dispatch(updateHostsAsync())}>Add Async</button>
    </div>
  );
};

export default PrintHosts;
