export interface StandardApiResponse {
  type: string;
  message: string;
  body: any;
}

export interface Rule {
  type: any;
  ruleType: string;
  warnLevel: number;
  criticalLevel: number;
}

export interface PostHostResponse {
  id: number;
  hostName: string;
  ip: string;
  hostRules: Rule[]; //todo rename to HostRule[];
  containersRules: ContainerRule[];
}

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
  containersRules: ContainerRule[];
  hostRules: any[]; //todo not any
}

export interface ContainerRule {
  alertType: AlertType;
  containerName: string;
  id: number; //todo obowiazkowe?
  type: RuleType;
}

export interface ContainerSummary {
  id: string; //todo change id to number
  name: string;
  image: string;
  status: string; //TODO DEFINE STATUS AFTER IT GETS CHANGED ON BACKEND
  cpuUsage: BasicMetric;
  memoryUsage: BasicMetric;
  alertType: AlertType;
  alert: boolean;
}

export interface BasicMetric {
  value: number;
  total: number;
  percent: number;
  alertType: AlertType;
  alert: boolean;
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

export interface AlertsResponse {
  type: string;
  message: string;
  body: AlertsResponseElement[];
}

export interface AlertsResponseElement {
  alertType: AlertType;
  hostId: number;
  percent: number;
  ruleType: string;
  time: string;
}

export interface AlertsResponseElementParsed {
  alertType: AlertType;
  hostId: number;
  percent: number;
  ruleType: string;
  time: Date;
}

export interface AddHostFormData {
  hostName: string;
  ip: string;
  cpuWarn: string;
  cpuCrit: string;
  memWarn: string;
  memCrit: string;
  diskWarn: string;
  diskCrit: string;
}
