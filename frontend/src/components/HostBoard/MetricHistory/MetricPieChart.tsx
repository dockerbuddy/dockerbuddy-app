import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { AlertType } from "../../../common/enums";
import theme from "../../../common/theme";
import { PercentMetric, HostPercentRule } from "../../../common/types";
import { alertColors } from "../../../common/alertStyle";
import { alertTypeToColor, humanFileSize } from "../../../common/util";

const renderActiveShape = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any,
  metric: PercentMetric | undefined,
  name: string
) => {
  const showVal = name != "CPU";
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  return (
    <g>
      <text
        x={cx}
        y={showVal ? cy - 30 : cy - 10}
        dy={8}
        textAnchor="middle"
        fill={fill}
        {...theme.palette.secondary}
        fontWeight="bold"
        fontSize="28"
      >
        <tspan>
          {name}: {metric?.percent}%
        </tspan>
      </text>
      <text
        x={cx}
        y={cy + 5}
        dy={8}
        textAnchor="middle"
        fill={fill}
        {...theme.palette.secondary}
        fontSize="28"
      >
        {showVal ? (
          <tspan>
            {humanFileSize(metric?.value)} / {humanFileSize(metric?.total)}
          </tspan>
        ) : (
          <></>
        )}
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
  metric: PercentMetric | undefined;
  name: string;
  rule: HostPercentRule | undefined;
}> = ({ metric, name, rule }) => {
  const thresholds = [
    { name: "OK", value: rule?.warnLevel },
    {
      name: "WARN",
      value: rule != undefined ? rule.criticalLevel - rule.warnLevel : 0,
    },
    {
      name: "CRITICAL",
      value: rule != undefined ? 100 - rule?.criticalLevel : 0,
    },
  ];

  const data = [
    { name: name, value: metric?.percent },
    {
      name: name + "-max",
      value: metric != undefined ? 100 - metric?.percent : 0,
    },
  ];
  const dataColors = [
    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    alertTypeToColor(AlertType[metric.alertType]),
    "#333333",
  ];

  const state = {
    activeIndex: 0,
  };

  return (
    <>
      <ResponsiveContainer width="100%" height={450}>
        <PieChart style={{ cursor: "pointer" }}>
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
            activeShape={(props) => renderActiveShape(props, metric, name)}
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
