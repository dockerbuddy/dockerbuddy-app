import { Paper, Typography } from "@material-ui/core";
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
import { alertColors } from "../../../common/alertStyle";
import { humanFileSize } from "../../../common/util";

export type InfluxBody = {
  time: string;
  value: number;
};

const MainChart: React.FC<{
  body: InfluxBody[];
  rule: HostPercentRule | undefined;
  metricType: string;
  metricName: string;
  totalValue: number;
}> = ({ body, rule, metricType, metricName, totalValue }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BetterTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data =
        metricType == "Percent" || metricName == "CPU_USAGE"
          ? payload[0].value + "%"
          : humanFileSize(payload[0].value);
      return (
        <Paper style={{ padding: "15px", backgroundColor: "rgba(8,1,9,0.8)" }}>
          <Typography>{`${metricType}: ${data}`}</Typography>
          <Typography>{`Time: ${new Date(label).toUTCString()}`}</Typography>
        </Paper>
      );
    }

    return null;
  };

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
          <XAxis
            dataKey="time"
            tickFormatter={(e) => new Date(e).toUTCString()}
            interval="preserveStartEnd"
            domain={body.length > 0 ? ["dataMin", "dataMax"] : ["", ""]}
          />
          {metricType == "Percent" || metricName == "CPU_USAGE" ? (
            <YAxis
              width={80}
              type="number"
              domain={[0, 100]}
              tickFormatter={(e) => e + "%"}
            />
          ) : (
            <YAxis
              width={80}
              type="number"
              domain={[0, totalValue]}
              tickFormatter={humanFileSize}
            />
          )}
          <Tooltip content={<BetterTooltip />} />
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
