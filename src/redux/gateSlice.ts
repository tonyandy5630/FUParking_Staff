import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export const gateInSlice = createSlice({
  name: "gateReducer",
  initialState: "",
  reducers: {
    setGateInId: (state, { payload }: PayloadAction<string>) => {
      state = payload;
      return payload;
    },
  },
});

export const gateOutSlice = createSlice({
  name: "gateOutReducer",
  initialState: "",
  reducers: {
    setGateOutId: (state, { payload }: PayloadAction<string>) => {
      state = payload;
      return payload;
    },
  },
});

export const { setGateInId } = gateInSlice.actions;
export const gateInReducer = gateInSlice.reducer;

export const { setGateOutId } = gateOutSlice.actions;
export const gateOutReducer = gateOutSlice.reducer;
