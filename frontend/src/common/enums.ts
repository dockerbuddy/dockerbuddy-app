export enum MetricType {
  CPU_USAGE = "CPU_USAGE",
  DISK_USAGE = "DISK_USAGE",
  MEMORY_USAGE = "MEMORY_USAGE",
}

export enum AlertType {
  OK = "success",
  WARN = "warning",
  CRITICAL = "error",
}

export enum RuleType {
  MEMORY_USAGE = "MEMORY_USAGE",
  DISK_USAGE = "DISK_USAGE",
  CPU_USAGE = "CPU_USAGE",
  CONTAINER_STATE = "CONTAINER_STATE",
}

export enum ContainerState {
  CREATED,
  RESTARTING,
  RUNNING,
  PAUSED,
  EXITED,
  DEAD,
}

export enum ReportStatus {
  NEW,
  NOT_WATCHED,
  WATCHED,
}
