import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import hostReducer from "../hosts/hostsSlice";

export const store = configureStore({
  reducer: {
    host: hostReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
