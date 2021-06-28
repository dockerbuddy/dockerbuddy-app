interface Data {
  _start: string;
  _stop: string;
  _time: string;
  _value: string;
}

interface Stats {
  percent: Data[];
  total: Data[];
  used: Data[];
}

interface Container {
  id: string;
  name: string;
  image: string;
  cpu_percentage: Data;
  memory_usage: Data;
  status: Data;
}

interface HostData {
  containers: Container[];
  disk: Stats;
  virtual_memory: Stats;
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