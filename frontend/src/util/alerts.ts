import { SnackbarMessage, OptionsObject, SnackbarKey } from "notistack";
import { HostSummary, AlertType } from "../common/types";

const alertText = (
  hostId: number,
  metricName: string,
  value: number
): string => {
  return `Host ${hostId} ${metricName} is ${value}%`;
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

  summaryParsed.containers.forEach((cont) => {
    if (cont.alert)
      enqueueSnackbar(
        // eslint-disable-next-line prettier/prettier
        alertText(Number.parseInt(cont.id), "Container", 0), //todo expand or create container specific alerts
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        { variant: AlertType[cont.alertType] }
      );

    if (cont.cpuUsage.alert)
      enqueueSnackbar(
        // eslint-disable-next-line prettier/prettier
          alertText(Number.parseInt(cont.id), "CPU usage", cont.cpuUsage.percent),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        { variant: AlertType[cont.cpuUsage.alertType] }
      );

    if (cont.memoryUsage.alert)
      enqueueSnackbar(
        // eslint-disable-next-line prettier/prettier
          alertText(Number.parseInt(cont.id), "Memory usage", cont.memoryUsage.percent),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        { variant: AlertType[cont.memoryUsage.alertType] }
      );
  });
};
