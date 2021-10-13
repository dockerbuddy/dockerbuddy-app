/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Grid, Select, TextField } from "@material-ui/core";
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

export type InfluxResponse = {
  message: string;
  type: string;
  body: InfluxBody[];
};

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
  const [hostHistory, setHostHistory] = useState<InfluxResponse>();
  const [error, setError] = useState<string>("");

  const handleQuery = async (data: QueryFormData) => {
    setError("");
    const response = await fetchHostHistory({ ...data, hostId });
    const result: StandardApiResponse = await response.json();
    if (response.ok) {
      setHostHistory(result);
    } else {
      setError(result.message);
    }
  };

  return (
    <Grid container item spacing={4}>
      <Grid item xs={2}>
        <form onSubmit={handleSubmit(handleQuery)}>
          <Grid container item direction="column" spacing={4}>
            <Grid item>
              <Select
                native
                defaultValue="Metric type"
                name="metricType"
                id="metric-type-select"
                label="Metric"
                inputRef={register({
                  required: "Required",
                })}
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
              <TextField
                name="start"
                label="Start time"
                inputRef={register({
                  required: "Start time is required",
                })}
                error={!!errors.start}
                helperText={errors.start?.message}
              />
            </Grid>
            <Grid item>
              <TextField
                name="end"
                label="End time"
                inputRef={register({
                  required: "End time is required",
                })}
                error={!!errors.start}
                helperText={errors.start?.message}
              />
            </Grid>
            <Grid item>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disableElevation
                fullWidth
              >
                Query
              </Button>
            </Grid>
          </Grid>
        </form>
      </Grid>
      <Grid item xs={10}>
        {typeof hostHistory !== "undefined" && (
          <MainChart body={hostHistory.body} />
        )}
      </Grid>
    </Grid>
  );
};

export default InfluxHistory;
