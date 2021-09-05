import { proxy } from "../common/api";

export function fetchHosts(): Promise<Response> {
  return fetch(`${proxy}/hosts`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
