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
  MEMORY_USAGE = "MemoryUsage",
  DISK_USAGE = "DiskUsage",
  CPU_USAGE = "CpuUsage",
  CONTAINER_STATE = "ContainerState",
}

export enum ContainerState {
  CREATED,
  RESTARTING,
  RUNNING,
  PAUSED,
  EXITED,
  DEAD,
}
