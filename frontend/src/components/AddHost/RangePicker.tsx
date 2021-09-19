import React from "react";
import Slider from "@material-ui/core/Slider";
import { Box, Typography } from "@material-ui/core";

interface RangePickerProps {
  range: number[];
  setRange: (newValue: number[]) => void;
}

const RangePicker: React.FC<RangePickerProps> = ({ range, setRange }) => {
  const handleRangeChange = (_event: unknown, newValue: number | number[]) => {
    typeof newValue === "number" ? setRange([newValue]) : setRange(newValue);
  };

  return (
    <Box>
      <Typography gutterBottom>Virtual memory range</Typography>
      <Slider
        track={false}
        aria-labelledby="track-false-range-slider"
        value={range}
        valueLabelDisplay="auto"
        onChange={handleRangeChange}
      />
    </Box>
  );
};

export default RangePicker;
