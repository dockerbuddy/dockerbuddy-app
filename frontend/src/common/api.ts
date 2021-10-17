export const proxy =
  process.env.NODE_ENV === "production"
    ? "/api/v2"
    : "http://localhost:8080/api/v2";

export const socketProxy = proxy + "/ws";

export function fetchHosts(): Promise<Response> {
  return fetch(`${proxy}/hosts`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function getHostSummary(id: number): Promise<Response> {
  return fetch(`${proxy}/hosts/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export type QueryParams = {
  metricType: string;
  hostId: string;
  start: string;
  end?: string;
};

export function fetchHostHistory(query: QueryParams): Promise<Response> {
  const url = new URL(`${proxy}/influxdb?`),
    params: any = {
      metricType: query.metricType,
      hostId: query.hostId,
      start: query.start,
      end: query.end,
    };
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key])
  );
  return fetch(url.toString());
}
