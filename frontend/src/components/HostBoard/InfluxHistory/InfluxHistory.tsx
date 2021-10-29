/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Button,
  Divider,
  Grid,
  InputLabel,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  DesktopDateRangePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/lab";
import React, { useState } from "react";
import { proxy } from "../../../common/api";
import { StandardApiResponse } from "../../../common/types";
import MainChart, { InfluxBody } from "./MainChart";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import { DateRange } from "@mui/lab/DateRangePicker/RangeTypes";
import plLocale from "date-fns/locale/pl";

type QueryParams = {
  metricType: string;
  hostId: string;
  start: string | number;
  end?: string | number;
};

type AllMetricQueries = {
  CPU: string[];
  Disk: string[];
  Memory: string[];
};

const allMetricQueries: AllMetricQueries = {
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
      start: (dateRange[0] != null ? dateRange[0] : yesterday).toISOString(),
      end: dateRange[1]?.toISOString(),
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
  const [dateRange, setDateRange] = React.useState<DateRange<Date>>([
    yesterday,
    new Date(),
  ]);
  const [metricType, setMetricType] = React.useState<string>(
    allMetricQueries.CPU[0]
  );

  const daysSpan = (date1: Date | null, date2: Date | null) => {
    if (date1 == null || date2 == null) {
      return 0;
    }
    const diff = Math.abs(date1.getTime() - date2.getTime());
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} locale={plLocale}>
      <Grid
        container
        direction="column"
        alignItems="stretch"
        justify="center"
        // style={{backgroundColor: "transparent", border: "3px solid", borderColor: "rgb(47, 40, 49)"}}
        spacing={3}
      >
        <Grid
          item
          xs={12}
          container
          spacing={3}
          alignItems="center"
          justify="flex-end"
        >
          <Grid item>
            <TimePicker
              label="From"
              value={dateRange[0]}
              onChange={(e) => setDateRange([e, dateRange[1]])}
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
              value={dateRange}
              onChange={(newValue) => {
                setDateRange(newValue);
              }}
              renderInput={(startProps, endProps) => (
                <React.Fragment>
                  <Grid container alignItems="flex-end" spacing={4}>
                    <Grid item>
                      {/* @ts-ignore */}
                      <TextField {...startProps} />
                    </Grid>
                    <Grid item>
                      <Typography align="center" variant="body1" gutterBottom>
                        Span: {daysSpan(dateRange[1], dateRange[0])} day(s)
                      </Typography>
                    </Grid>
                    <Grid item>
                      {/* @ts-ignore */}
                      <TextField {...endProps} />
                    </Grid>
                  </Grid>
                </React.Fragment>
              )}
            />
          </Grid>
          <Grid item>
            <TimePicker
              label="To"
              value={dateRange[1]}
              onChange={(e) => setDateRange([dateRange[0], e])}
              // @ts-ignore
              renderInput={(params) => <TextField {...params} />}
            />
          </Grid>
          <Divider
            variant="fullWidth"
            orientation="vertical"
            flexItem
            style={{ width: 3 }}
          />
          <Grid item>
            <InputLabel
              variant="standard"
              htmlFor="uncontrolled-native"
              style={{ fontSize: "12px", height: "16px" }}
            >
              Metric Type
            </InputLabel>
            <Select
              native
              defaultValue={metricType}
              name="metricType"
              id="metric-type-select"
              onChange={(e) => setMetricType(e.target.value as string)}
            >
              {Object.keys(allMetricQueries).map((key: string) => {
                return (
                  <optgroup key={key} label={key}>
                    {allMetricQueries[key as keyof AllMetricQueries].map(
                      (val: string) => {
                        return (
                          <option key={val} value={val}>
                            {val}
                          </option>
                        );
                      }
                    )}
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
          </Grid>
        </Grid>
        <Grid item xs={12}>
          {typeof hostHistory !== "undefined" && error == "" && (
            <MainChart body={hostHistory} />
          )}
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default InfluxHistory;
