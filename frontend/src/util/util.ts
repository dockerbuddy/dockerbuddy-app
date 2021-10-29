import { MetricType, AlertType } from "../common/enums";
import { BasicMetric } from "../common/types";
import { alertColors } from "./alertStyle";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function humanFileSize(size: number | undefined): string {
  if (size === 0 || size === undefined) return "0";
  const i = Math.floor(Math.log(+size) / Math.log(1024));
  const y: any = +size / Math.pow(1024, i); //TODO number throw error
  return (
    y.toFixed(2) * 1 +
    " " +
    ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][i]
  );
}

function addZero(i: number) {
  if (i < 10) {
    return "0" + i;
  }
  return i;
}

export function parseDateToHour(date: Date): string {
  const h = addZero(date.getHours());
  const m = addZero(date.getMinutes());
  const s = addZero(date.getSeconds());
  return h + ":" + m + ":" + s;
}

export function parseDateToDDMMYYYY(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0"); //January is 0!
  const yyyy = date.getFullYear();

  return dd + "." + mm + "." + yyyy;
}

export function extractMetric(
  metrics: BasicMetric[],
  type: MetricType
): BasicMetric | undefined {
  return metrics?.find(
    (metric) => MetricType[metric.metricType] === type.valueOf()
  );
}

export function alertTypeToColor(type: AlertType): string {
  switch (type) {
    case AlertType.CRITICAL:
      return alertColors.red;
    case AlertType.WARN:
      return alertColors.yellow;
  }
  return alertColors.default;
}
