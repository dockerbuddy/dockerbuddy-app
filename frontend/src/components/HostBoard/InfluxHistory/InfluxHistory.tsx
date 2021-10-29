/* eslint-disable */
import { Box, Button, Grid, Select, TextField } from "@material-ui/core";
import { DatePicker, DateRangePicker, DesktopDatePicker, DesktopDateRangePicker, LocalizationProvider, TimePicker } from "@mui/lab";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { proxy } from "../../../common/api";
import { StandardApiResponse } from "../../../common/types";
import MainChart from "./MainChart";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { DateRange } from "@mui/lab/DateRangePicker/RangeTypes";
import plLocale from "date-fns/locale/pl";


type QueryParams = {
  metricType: string;
  hostId: string;
  start: string | number;
  end?: string | number;
};

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
  const [hostHistory, setHostHistory] = useState<InfluxBody[]>();
  const [error, setError] = useState<string>("");

  function fetchHostHistory(query: QueryParams): Promise<Response> {
    const url = new URL(`${proxy}/influxdb?`),
      params: any = {
        metricType: query.metricType,
        hostId: query.hostId,
        start: query.start,
        end: query.end,
      };
    Object.keys(params).forEach((key) =>
      url.searchParams.append(key, params[key])
    );
    return fetch(url.toString());
  }

  const handleQuery = async () => {
    setError("");
    const query: QueryParams = {
      metricType: metricType,
      hostId: hostId,
      start: value[0] != null ? value[0].getTime() : -1,
      end: value[1]?.getTime(),
    };
    const response = await fetchHostHistory(query);
    const result: StandardApiResponse<InfluxBody[]> = await response.json();
    if (response.ok) {
      setHostHistory(result.body);
    } else {
      setError(result.message);
    }
  };

  const yesterday = new Date();
  yesterday.setDate(new Date().getDate() - 1);
  const [value, setValue] = React.useState<DateRange<Date>>([yesterday, new Date()]);
  const [metricType, setMetricType] = React.useState<string>(tmp.CPU[0]);

  const daysSpan = (date1: Date | null, date2: Date | null) => {
    if(date1 == null || date2 == null) {
      return 0;
    }
    const diff = Math.abs(date1.getTime() - date2.getTime());
    return Math.ceil(diff / (1000 * 3600 * 24)); 
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} locale={plLocale}>
      <Grid container spacing={4}>
        <Grid item>
          <TimePicker
            label="Start time"
            value={value[0]}
            onChange={(e) => setValue([e, value[1]])}
            // @ts-ignore
            renderInput={(params) => <TextField {...params} />}
          />
        </Grid>
        <Grid item>
          <DesktopDateRangePicker
            disableFuture
            startText="From"
            endText="To"
            inputFormat="dd/MM/yyyy"
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
            }}
            renderInput={(startProps, endProps) => (
              <React.Fragment>
                {/* @ts-ignore */}
                <TextField {...startProps} />
                {/* @ts-ignore */}
                <Box> Days: {daysSpan(value[1], value[0])}... </Box>
                {/* @ts-ignore */}
                <TextField {...endProps} />
              </React.Fragment>
            )}
          />
        </Grid>
        <Grid item>
          <TimePicker
            label="End time"
            value={value[1]}
            onChange={(e) => setValue([value[0], e])}
            // @ts-ignore
            renderInput={(params) => <TextField {...params} />}
          />
        </Grid>
      </Grid>


      <Grid item>
        <Select
          native
          defaultValue={metricType}
          name="metricType"
          id="metric-type-select"
          label="Metric"
          onChange={(e) => setMetricType(e.target.value as string)}
        >
          <option value="">Metric-type</option>
          {Object.keys(tmp).map((key: string) => {
            return (
              <optgroup key={key} label={key}>
                {tmp[key as keyof tmpp].map((val: string) => {
                  return (
                    <option key={val} value={val}>
                      {val}
                    </option>
                  );
                })}
              </optgroup>
            );
          })}
        </Select>
      </Grid>
      <Grid item>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disableElevation
          fullWidth
          onClick={handleQuery}
        >
          Query
        </Button>
      <Grid item xs={10}>
          {typeof hostHistory !== "undefined" && <MainChart body={hostHistory} />}
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default InfluxHistory;
