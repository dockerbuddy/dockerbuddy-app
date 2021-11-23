import {
  RuleType,
  AlertType,
  ContainerState,
  MetricType,
  ReportStatus,
} from "./enums";

export type StandardApiResponse<T> = {
  type: string;
  message: string;
  body: T;
};

export interface HostPercentRule {
  id?: string;
  type: RuleType;
  warnLevel: number;
  criticalLevel: number;
}

export interface HostBasicRule {
  id?: string;
  type: RuleType;
  warnLevel: number;
  criticalLevel: number;
}

export interface HostSummary {
  id: string;
  timestamp: string;
  basicMetrics: PercentMetric[];
  percentMetrics: PercentMetric[];
  containers: Container[];
}

export interface Host {
  id: string;
  hostName: string;
  ip: string;
  hostSummary: HostSummary;
  containersReports: ContainerReport[];
  hostBasicRules: HostBasicRule[];
  hostPercentRules: HostPercentRule[];
}

export interface ContainerReport {
  containerName: string;
  reportStatus: ReportStatus;
}

export interface Container {
  id: string;
  name: string;
  image: string;
  status: ContainerState;
  metrics: PercentMetric[];
  alertType: AlertType;
  reportStatus: ReportStatus;
}

export interface BasicMetricss {
  value: number;
  alertType: AlertType;
  metricType: MetricType;
}

export interface PercentMetric {
  value: number;
  total: number;
  percent: number;
  alertType: AlertType;
  metricType: MetricType;
}

export interface AlertsResponseElement {
  alertType: AlertType;
  hostId: string;
  alertMessage: string;
  time: Date;
}

export interface AlertsSummary {
  alert: AlertsResponseElement;
  alertsCounter: number;
}

export interface Alert {
  hostId: string;
  alertType: AlertType;
  alertMessage: string;
}
