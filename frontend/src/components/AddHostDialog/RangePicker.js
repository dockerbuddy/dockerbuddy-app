/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from "react";
import Slider from "@material-ui/core/Slider";
import { Box, Typography } from "@material-ui/core";

const RangePicker = ({ ranges, setRanges }) => {
  const handleChange = (event, newValue) => {
    if (newValue[0] >= newValue[1]) {
      return;
    }
    setRanges(newValue);
    console.log(newValue);
  };

  return (
    <Box>
      <Typography gutterBottom>Alerts range</Typography>
      <Slider
        track={false}
        aria-labelledby="track-false-range-slider"
        value={ranges}
        valueLabelDisplay="auto"
        onChange={handleChange}
      />
    </Box>
  );
};

export default RangePicker;
