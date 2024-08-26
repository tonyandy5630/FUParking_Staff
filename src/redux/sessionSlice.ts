import { SessionCard } from "@my_types/session-card";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const initState: SessionCard = {
  cardNumber: "",
  cardStatus: "",
  gateIn: "",
  plateNumber: "",
  sessionId: "",
  timeIn: "",
  vehicleType: "",
};

export const sessionSlice = createSlice({
  name: "session",
  initialState: initState,
  reducers: {
    setNewSessionInfo: (state, { payload }: PayloadAction<SessionCard>) => {
      Object.assign(state, JSON.parse(JSON.stringify(payload)));
    },
  },
});

export const { setNewSessionInfo } = sessionSlice.actions;
export default sessionSlice.reducer;
