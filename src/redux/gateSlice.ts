import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export const gateInSlice = createSlice({
  name: "gateReducer",
  initialState: "",
  reducers: {
    setGateId: (state, { payload }: PayloadAction<string>) => {
      state = payload;
      return payload;
    },
  },
});

export const { setGateId } = gateInSlice.actions;
export const gateReducer = gateInSlice.reducer;
