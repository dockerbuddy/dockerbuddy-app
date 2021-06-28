/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from "react";
import Slider from "@material-ui/core/Slider";
import { Box, Typography } from "@material-ui/core";

const RangePicker = ({
  virtualRange,
  setVirtualRange,
  diskRange,
  setDiskRange,
}) => {
  const handleChangeVirtual = (event, newValue) => {
    setVirtualRange(newValue);
  };

  const handleChangeDisk = (event, newValue) => {
    setDiskRange(newValue);
  };

  return (
    <Box>
      <Box>
        <Typography gutterBottom>Virtual memory range</Typography>
        <Slider
          track={false}
          aria-labelledby="track-false-range-slider"
          value={virtualRange}
          valueLabelDisplay="auto"
          onChange={handleChangeVirtual}
        />
      </Box>

      <Box mt={3}>
        <Typography gutterBottom>Disk range</Typography>
        <Slider
          track={false}
          aria-labelledby="track-false-range-slider"
          value={diskRange}
          valueLabelDisplay="auto"
          onChange={handleChangeDisk}
        />
      </Box>
    </Box>
  );
};

export default RangePicker;
