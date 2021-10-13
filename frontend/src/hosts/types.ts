export interface HostSummary {
  id: number;
  timestamp: string;
  memoryUsage: BasicMetric;
  diskUsage: BasicMetric;
  cpuUsage: BasicMetric;
  containers: ContainerSummary[];
}

export interface FullHostSummary {
  hostName: string;
  ip: string;
  id: number;
  hostSummary: HostSummary;
  containerRules: ContainerRule[];
  hostRules: any[]; //todo not any
}

export interface ContainerRule {
  alertType: AlertType;
  containerName: string;
  id: number; //todo obowiazkowe?
  type: RuleType;
}

export interface ContainerSummary {
  id: string;
  name: string;
  image: string;
  status: string; //TODO DEFINE STATUS AFTER IT GETS CHANGED ON BACKEND
  cpuUsage: BasicMetric;
  memoryUsage: BasicMetric;
}

export interface BasicMetric {
  value: number;
  total: number;
  percent: number;
  alertType: AlertType;
  alert: boolean;
}

export enum AlertType {
  OK,
  WARN,
  CRITICAL,
}

export enum RuleType {
  MEMORY_USAGE,
  DISK_USAGE,
  CPU_USAGE,
  CONTAINER_STATE,
}
