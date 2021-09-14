import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../redux/store";
import { fetchHosts } from "../common/api";
import { FullHostSummary, HostSummary } from "./types";

export interface HostState {
  status: "LOADING" | "ERROR" | "LOADED";
  hosts: {
    [id: number]: FullHostSummary;
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
        if (hosts == null) {
          state.status = "ERROR";
          state.hosts = [];
        } else if (hosts.length > 0) {
          state.status = "LOADED";
          hosts.forEach((e: FullHostSummary) => {
            state.hosts[e.id] = e;
          });
        } else {
          state.status = "LOADED";
          state.hosts = [];
        }
      });
  },
});

export const { updateSingleHost } = hostsSlice.actions;
export const selectHost = (state: RootState) => state.host;

export default hostsSlice.reducer;
