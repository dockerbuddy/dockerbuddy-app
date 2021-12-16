/* eslint-disable @typescript-eslint/no-unused-vars */
import { Typography } from "@material-ui/core";
import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { HostPercentRule } from "../../../common/types";
import { alertColors } from "../../../util/alertStyle";

export type InfluxBody = {
  time: string;
  value: number;
};

const MainChart: React.FC<{
  body: InfluxBody[];
  rule: HostPercentRule | undefined;
  metricType: string;
  totalValue: number;
}> = ({ body, rule, metricType, totalValue }) => {
  const criticalOffset = () => {
    if (rule == undefined || metricType == "Total") {
      return 0;
    }
    const dataMax = Math.max(...body.map((i) => i.value));
    const tmp =
      metricType == "Percent"
        ? rule.criticalLevel
        : (totalValue * rule.criticalLevel) / 100;
    if (dataMax < tmp) {
      return 0;
    }
    return (dataMax - tmp) / dataMax;
  };

  const warnOffset = () => {
    if (rule == undefined || metricType == "Total") {
      return 0;
    }
    const dataMax = Math.max(...body.map((i) => i.value));
    const tmp =
      metricType == "Percent"
        ? rule.warnLevel
        : (totalValue * rule.warnLevel) / 100;
    if (dataMax < tmp) {
      return 0;
    }
    return (dataMax - tmp) / dataMax;
  };

  const criticalOff = criticalOffset();
  const warnOff = warnOffset();

  return (
    <>
      <ResponsiveContainer width="100%" height={500}>
        <AreaChart data={body} margin={{ right: 40 }}>
          <Typography>No data to show :(</Typography>
          <CartesianGrid strokeDasharray="7 7" stroke={alertColors.disabled} />
          <XAxis dataKey="time" />
          {metricType == "Percent" ? (
            <YAxis type="number" domain={[0, 100]} />
          ) : (
            <YAxis type="number" domain={[0, totalValue]} />
          )}
          <Tooltip />
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              {rule != undefined ? (
                <>
                  <stop
                    offset={criticalOff}
                    stopColor={alertColors.red}
                    stopOpacity={1}
                  />
                  <stop
                    offset={criticalOff}
                    stopColor={alertColors.yellow}
                    stopOpacity={1}
                  />
                  <stop
                    offset={warnOff}
                    stopColor={alertColors.yellow}
                    stopOpacity={1}
                  />
                  <stop
                    offset={warnOff}
                    stopColor={alertColors.default}
                    stopOpacity={1}
                  />{" "}
                </>
              ) : (
                <stop
                  offset={1}
                  stopColor={alertColors.default}
                  stopOpacity={1}
                />
              )}
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke="transparent"
            fill="url(#splitColor)"
          />
          {rule != undefined && metricType != "Total" && (
            <>
              <ReferenceLine
                y={
                  metricType == "Percent"
                    ? rule.criticalLevel
                    : (rule.criticalLevel * totalValue) / 100
                }
                stroke={alertColors.red}
                strokeDasharray="10 10"
              />
              <ReferenceLine
                y={
                  metricType == "Percent"
                    ? rule.warnLevel
                    : (rule.warnLevel * totalValue) / 100
                }
                stroke={alertColors.yellow}
                strokeDasharray="10 10"
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};

export default MainChart;
