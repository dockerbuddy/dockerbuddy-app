/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { AlertType } from "../../common/enums";
import { BasicMetric, HostRule } from "../../common/types";
import { alertColors } from "../../util/alertStyle";
import { alertTypeToColor } from "../../util/util";

const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
  } = props;

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

const colors = [alertColors.default, alertColors.yellow, alertColors.red];

const MetricPieChart: React.FC<{
  metric: BasicMetric | undefined;
  name: string;
  rule: HostRule | undefined;
}> = ({ metric, name, rule }) => {
  const thresholds = [
    { name: "OK", value: rule?.warnLevel },
    //@ts-ignore
    { name: "WARN", value: rule?.criticalLevel - rule?.warnLevel },
    //@ts-ignore
    { name: "CRITICAL", value: 100 - rule?.criticalLevel },
  ];

  const data = [
    { name: name, value: metric?.percent },
    // @ts-ignore
    { name: name + "-max", value: 100 - metric?.percent },
  ];
  const dataColors = [
    //@ts-ignore
    alertTypeToColor(AlertType[metric.alertType]),
    "#333333",
  ];

  const state = {
    activeIndex: 0,
  };

  return (
    <>
      <ResponsiveContainer width="100%" height={500}>
        <PieChart>
          <Pie
            startAngle={200}
            endAngle={-20}
            data={thresholds}
            dataKey="value"
            innerRadius="90%"
            outerRadius="100%"
            stroke="transparent"
          >
            {thresholds.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
              />
            ))}
          </Pie>
          <Pie
            startAngle={200}
            endAngle={-20}
            data={data}
            dataKey="value"
            innerRadius="65%"
            outerRadius="89%"
            stroke="transparent"
            activeIndex={state.activeIndex}
            activeShape={renderActiveShape}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={dataColors[index % dataColors.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </>
  );
};

export default MetricPieChart;
