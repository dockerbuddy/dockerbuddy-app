interface HostData {
  name: string;
  ip: string;
}

type ContextState =
  {
    status: "LOADING" | "ERROR";
  }
| {
    status: "LOADED";
    hosts: HostData[];
  };