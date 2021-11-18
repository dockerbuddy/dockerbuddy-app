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

export function getHostSummary(id: string): Promise<Response> {
  return fetch(`${proxy}/hosts/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export function fetchCounter(): Promise<Response> {
  return fetch(`${proxy}/influxdb/alertsCounter`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
