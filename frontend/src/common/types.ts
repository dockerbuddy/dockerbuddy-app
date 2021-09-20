export interface StandardApiResponse {
  type: string;
  message: string;
  body: any;
}

export interface Rule {
  ruleType: string;
  warnLevel: number;
  criticalLevel: number;
}

export interface PostHostResponse {
  id: number;
  hostName: string;
  ip: string;
  rules: Rule[];
}
