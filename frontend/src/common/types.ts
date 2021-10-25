import { RuleType, AlertType, ContainerState, MetricType } from "./enums";

export type StandardApiResponse<T> = {
  type: string;
  message: string;
  body: T;
};

export interface HostRule {
  id?: number;
  type: RuleType;
  warnLevel: number;
  criticalLevel: number;
}

export interface HostSummary {
  id: number;
  timestamp: string;
  metrics: BasicMetric[];
  containers: Container[];
}

export interface Host {
  id: number;
  hostName: string;
  ip: string;
  hostSummary: HostSummary;
  containersRules: ContainerRule[];
  hostRules: HostRule[];
}

export interface ContainerRule {
  id: number;
  alertType: AlertType;
  containerName: string;
  type: RuleType; //todo MEM, CPU, DISK Usage right now isnt used
}

export interface Container {
  id: string;
  name: string;
  image: string;
  status: ContainerState;
  metrics: BasicMetric[];
  alertType: AlertType;
}

export interface BasicMetric {
  value: number;
  total: number;
  percent: number;
  alertType: AlertType;
  metricType: MetricType;
}

export interface AlertsResponseElement {
  alertType: AlertType;
  hostId: number;
  alertMessage: string;
  time: Date;
}

export interface Alert {
  hostId: number;
  alertType: AlertType;
  alertMessage: string;
}
