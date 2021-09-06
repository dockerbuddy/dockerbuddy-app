import React from "react";
import Slider from "@material-ui/core/Slider";
import { Box, Typography } from "@material-ui/core";

interface RangePickerProps {
  virtualRange: number[];
  setVirtualRange: (newValue: number[]) => void;
  diskRange: number[];
  setDiskRange: (newValue: number[]) => void;
}

const RangePicker: React.FC<RangePickerProps> = ({
  virtualRange,
  setVirtualRange,
  diskRange,
  setDiskRange,
}) => {
  const handleChangeVirtual = (_event: any, newValue: number | number[]) => {
    typeof newValue === "number"
      ? setVirtualRange([newValue])
      : setVirtualRange(newValue);
  };

  const handleChangeDisk = (_event: any, newValue: number | number[]) => {
    typeof newValue === "number"
      ? setDiskRange([newValue])
      : setDiskRange(newValue);
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
