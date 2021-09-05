import { BasicMetric } from "../hosts/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function humanFileSize(size: string): string {
  if (size === "0") return "0";
  const i = Math.floor(Math.log(+size) / Math.log(1024));
  const y: any = +size / Math.pow(1024, i); //TODO number throw error
  return y.toFixed(2) * 1 + " " + ["B", "kB", "MB", "GB", "TB"][i];
}

export function getLatestStats(stats: BasicMetric): {
  used: string;
  total: string;
  percent: number;
} {
  try {
    return {
      used: stats.value,
      total: stats.total,
      percent: +stats.percent,
    };
  } catch (e) {
    //TODO return another type?
    console.warn("Couldn't get first element. " + e);
    return {
      used: "",
      total: "",
      percent: 0,
    };
  }
}
