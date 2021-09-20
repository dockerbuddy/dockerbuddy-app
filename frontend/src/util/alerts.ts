import { SnackbarMessage, OptionsObject, SnackbarKey } from "notistack";
import { HostSummary, AlertType } from "../common/types";

const alertText = (
  hostId: number,
  metricName: string,
  value: number
): string => {
  return `Host ${hostId} ${metricName} is ${value * 100}%`;
};

export const showAlert = (
  summaryParsed: HostSummary,
  enqueueSnackbar: (
    message: SnackbarMessage,
    options?: OptionsObject | undefined
  ) => SnackbarKey
): void => {
  if (summaryParsed.cpuUsage.alert)
    enqueueSnackbar(
      alertText(summaryParsed.id, "CPU usage", summaryParsed.cpuUsage.percent),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      { variant: AlertType[summaryParsed.cpuUsage.alertType] }
    );

  if (summaryParsed.diskUsage.alert)
    enqueueSnackbar(
      alertText(
        summaryParsed.id,
        "Disk usage",
        summaryParsed.diskUsage.percent
      ),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      { variant: AlertType[summaryParsed.diskUsage.alertType] }
    );

  if (summaryParsed.memoryUsage.alert)
    enqueueSnackbar(
      // eslint-disable-next-line prettier/prettier
        alertText(summaryParsed.id, "Memory usage", summaryParsed.memoryUsage.percent),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      { variant: AlertType[summaryParsed.memoryUsage.alertType] }
    );
};
