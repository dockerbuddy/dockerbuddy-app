/* eslint-disable @typescript-eslint/no-explicit-any */
export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function humanFileSize(size: number): string {
  if (size === 0) return "0";
  const i = Math.floor(Math.log(+size) / Math.log(1024));
  const y: any = +size / Math.pow(1024, i); //TODO number throw error
  return (
    y.toFixed(2) * 1 +
    " " +
    ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][i]
  );
}
