import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchCounter } from "../common/api";
import { RootState } from "./store";

export interface AlertCounterState {
  value: number;
}

const initialState: AlertCounterState = {
  value: 0,
};

export const updateAlertCounter = createAsyncThunk(
  "counter/update",
  async () => {
    const response = await fetchCounter();
    if (response.ok) {
      return response.json();
    }
    return {
      value: 0,
    };
  }
);

export const alertCounterSlice = createSlice({
  name: "alertCounter",
  initialState,
  reducers: {
    setCounter: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateAlertCounter.pending, (state) => {
        state.value = 0;
      })
      .addCase(updateAlertCounter.fulfilled, (state, action) => {
        state.value = action.payload.body;
      });
  },
});

export const { setCounter } = alertCounterSlice.actions;
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const selectCounter = (state: RootState) => state.alertCounter;

export default alertCounterSlice.reducer;
