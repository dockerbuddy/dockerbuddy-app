/* eslint-disable */
import { Button, Grid, Select, TextField } from "@material-ui/core";
import { DatePicker } from "@mui/lab";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { fetchHostHistory, QueryParams } from "../../../common/api";
import { StandardApiResponse } from "../../../common/types";
import MainChart from "./MainChart";

interface QueryFormData {
  metricType: string;
  start: string;
  end?: string;
}

export type InfluxBody = {
  time: string;
  value: number;
};

type tmpp = {
  CPU: string[];
  Disk: string[];
  Memory: string[];
};

const tmp: tmpp = {
  CPU: ["cpu_usage_total", "cpu_usage_percent", "cpu_usage_value"],
  Disk: ["disk_usage_total", "disk_usage_percent", "disk_usage_value"],
  Memory: ["memory_usage_total", "memory_usage_percent", "memory_usage_value"],
};

const InfluxHistory: React.FC<{ hostId: number }> = (props) => {
  const hostId: string = props.hostId.toString();
  const { register, errors, handleSubmit } = useForm<QueryFormData>();
  const [hostHistory, setHostHistory] = useState<InfluxBody[]>();
  const [error, setError] = useState<string>("");

  const handleQuery = async (data: QueryFormData) => {
    setError("");
    const response = await fetchHostHistory({ ...data, hostId });
    const result: StandardApiResponse<InfluxBody[]> = await response.json();
    if (response.ok) {
      setHostHistory(result.body);
    } else {
      setError(result.message);
    }
  };

  const [start, setStart] = React.useState(new Date());

  const tmp = (newValue: Date | null) => {
    if (newValue !== null)
      setStart(newValue);
  }

  return (
    <Grid container spacing={4}>
      <Grid item>
        {/* <DatePicker 
          label="Start"
          inputFormat="dd/MM/yyyy"
          value={start}
          onChange={tmp}
          renderInput={(params) => <TextField {...params} />}
          /> */}
      </Grid>
    </Grid>
    // <Grid container item spacing={4}>
    //   <Grid item xs={2}>
    //     <form onSubmit={handleSubmit(handleQuery)}>
    //       <Grid container item direction="column" spacing={4}>
    //         <Grid item>
    //           <Select
    //             native
    //             defaultValue="Metric type"
    //             name="metricType"
    //             id="metric-type-select"
    //             label="Metric"
    //             inputRef={register({
    //               required: "Required",
    //             })}
    //           >
    //             <option value="">Metric-type</option>
    //             {Object.keys(tmp).map((key: string) => {
    //               return (
    //                 <optgroup key={key} label={key}>
    //                   {tmp[key as keyof tmpp].map((val: string) => {
    //                     return (
    //                       <option key={val} value={val}>
    //                         {val}
    //                       </option>
    //                     );
    //                   })}
    //                 </optgroup>
    //               );
    //             })}
    //           </Select>
    //         </Grid>
    //         <Grid item>
    //           <TextField
    //             name="start"
    //             label="Start time"
    //             inputRef={register({
    //               required: "Start time is required",
    //             })}
    //             error={!!errors.start}
    //             helperText={errors.start?.message}
    //           />
    //         </Grid>
    //         <Grid item>
    //           <TextField
    //             name="end"
    //             label="End time"
    //             inputRef={register({
    //               required: "End time is required",
    //             })}
    //             error={!!errors.start}
    //             helperText={errors.start?.message}
    //           />
    //         </Grid>
    //         <Grid item>
    //           <Button
    //             type="submit"
    //             variant="contained"
    //             color="primary"
    //             disableElevation
    //             fullWidth
    //           >
    //             Query
    //           </Button>
    //         </Grid>
    //       </Grid>
    //     </form>
    //   </Grid>
    //   <Grid item xs={10}>
    //     {typeof hostHistory !== "undefined" && <MainChart body={hostHistory} />}
    //   </Grid>
    // </Grid>
  );
};

export default InfluxHistory;
