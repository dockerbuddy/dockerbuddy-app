export const cont1 = {
  id: "6ac25993-4769-44a0-8ee5-930867e22261",
  name: "mock_container_1",
  image: "dockera-app",
  status: null,
  metrics: [
    {
      metricType: "CPU_USAGE",
      value: 10.0,
      total: 100.0,
      percent: 10.0,
      alertType: null,
    },
    {
      metricType: "MEMORY_USAGE",
      value: 10.0,
      total: 100.0,
      percent: 10.0,
      alertType: null,
    },
  ],
  alertType: null,
  reportStatus: "NEW",
};

export const cont2 = {
  id: "6ac25993-4769-44a0-8ee5-930867e22262",
  name: "mock_container_2",
  image: "dockera-app",
  status: null,
  metrics: [
    {
      metricType: "CPU_USAGE",
      value: 10.0,
      total: 100.0,
      percent: 10.0,
      alertType: null,
    },
    {
      metricType: "MEMORY_USAGE",
      value: 10.0,
      total: 100.0,
      percent: 10.0,
      alertType: null,
    },
  ],
  alertType: null,
  reportStatus: "WATCHED",
};

export const cont3 = {
  id: "6ac25993-4769-44a0-8ee5-930867e22262",
  name: "mock_container_2",
  image: "dockera-app",
  status: null,
  metrics: [
    {
      metricType: "CPU_USAGE",
      value: 10.0,
      total: 100.0,
      percent: 10.0,
      alertType: null,
    },
    {
      metricType: "MEMORY_USAGE",
      value: 10.0,
      total: 100.0,
      percent: 10.0,
      alertType: null,
    },
  ],
  alertType: null,
  reportStatus: "NOT_WATCHED",
};

export const cont4 = {
  id: "6ac25993-4769-44a0-8ee5-930867e22262",
  name: "mock_container_2",
  image: "dockera-app",
  status: "RUNNING",
  metrics: [
    {
      metricType: "CPU_USAGE",
      value: 10.0,
      total: 100.0,
      percent: 10.0,
      alertType: "CRITICAL",
    },
    {
      metricType: "MEMORY_USAGE",
      value: 10.0,
      total: 100.0,
      percent: 10.0,
      alertType: "CRITICAL",
    },
  ],
  alertType: "CRITICAL",
  reportStatus: "WATCHED",
};
