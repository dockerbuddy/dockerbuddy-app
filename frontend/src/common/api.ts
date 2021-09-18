export const proxy = "http://localhost:8080/api/v2";

export function fetchHosts(): Promise<Response> {
  return fetch(`${proxy}/hosts`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
