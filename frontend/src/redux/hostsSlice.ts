import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { fetchHosts, getHostSummary } from "../common/api";
import { Host, HostSummary } from "../common/types";

export interface HostState {
  status: "LOADING" | "ERROR" | "LOADED";
  hosts: {
    [id: string]: Host;
  };
}

const initialState: HostState = {
  status: "LOADING",
  hosts: {},
};

export const updateHostsAsync = createAsyncThunk("hosts/update", async () => {
  const response = await fetchHosts();
  if (response.ok) {
    return response.json();
  }
  return [];
});

export const updateSingleHostAsync = createAsyncThunk(
  "hosts/update/single",
  async (hostId: string) => {
    const response = await getHostSummary(hostId);
    if (response.ok) {
      return response.json();
    }
    return {};
  }
);

export const hostsSlice = createSlice({
  name: "hosts",
  initialState,
  reducers: {
    updateSingleHost: (state, action: PayloadAction<HostSummary>) => {
      if (state.hosts[action.payload.id]) {
        state.hosts[action.payload.id].hostSummary = { ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateHostsAsync.pending, (state) => {
        state.status = "LOADING";
      })
      .addCase(updateHostsAsync.fulfilled, (state, action) => {
        const hosts = action.payload.body;
        state.hosts = {};
        if (hosts == null) {
          state.status = "ERROR";
        } else if (hosts.length > 0) {
          hosts.forEach((e: Host) => {
            state.hosts[e.id] = e;
          });
          state.status = "LOADED";
        } else {
          state.status = "LOADED";
        }
      })
      .addCase(updateSingleHostAsync.fulfilled, (state, action) => {
        const host = action.payload.body;
        if (host != null) {
          state.hosts[host.id] = host;
        }
      });
  },
});

export const { updateSingleHost } = hostsSlice.actions;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const selectHost = (state: RootState) => state.host;

export default hostsSlice.reducer;
