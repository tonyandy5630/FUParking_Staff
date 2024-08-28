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
  imageInBodyUrl: "",
  imageInUrl: "",
  isClosed: false,
};

const initSessionTable: SessionCard[] = [];

export const sessionSlice = createSlice({
  name: "session",
  initialState: initState,
  reducers: {
    setNewSessionInfo: (state, { payload }: PayloadAction<SessionCard>) => {
      Object.assign(state, JSON.parse(JSON.stringify(payload)));
    },
  },
});

export const sessionTableSlice = createSlice({
  name: "sessiontable",
  initialState: initSessionTable,
  reducers: {
    setNewTable: (state, { payload }: PayloadAction<SessionCard[]>) => {
      console.log(payload);
      return [...payload];
    },
    setSessionTableItem: (state, { payload }: PayloadAction<SessionCard>) => {
      const newState = state.map((item) => {
        if (item.sessionId === payload.sessionId) {
          return { ...item, ...payload };
        }
        return item;
      });
      return [...newState];
    },
  },
});

export const { setNewTable, setSessionTableItem } = sessionTableSlice.actions;
export const sessionTableReducer = sessionTableSlice.reducer;

export const { setNewSessionInfo } = sessionSlice.actions;
export default sessionSlice.reducer;
