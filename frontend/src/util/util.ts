export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function humanFileSize(size: string): string {
  const i = Math.floor(Math.log(+size) / Math.log(1024));
  const y: any = +size / Math.pow(1024, i); //TODO number throw error
  return y.toFixed(2) * 1 + " " + ["B", "kB", "MB", "GB", "TB"][i];
}

export function getLatestStats(stats: Stats): {
  used: string;
  total: string;
  percent: number;
} {
  try {
    return {
      used: stats.used[0]._value,
      total: stats.total[0]._value,
      percent: +stats.percent[0]._value,
    };
  } catch (e) {
    throw new Error("Couldn't get first element. " + e);
  }
}
