import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { InfluxBody } from "./InfluxHistory";

const MainChart: React.FC<{ body: InfluxBody[] }> = (props) => {
  return (
    <>
      <ResponsiveContainer width="100%" height={500}>
        <AreaChart
          data={props.body}
          // margin={{
          //   top: 10,
          //   right: 30,
          //   left: 0,
          //   bottom: 0,
          // }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3ED7C2"
            fill="#3ED7C2"
          />
        </AreaChart>
      </ResponsiveContainer>
    </>
  );
};

export default MainChart;
