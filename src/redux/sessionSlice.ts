import { SessionCard } from "@my_types/session-card";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export const initSessionCard: SessionCard = {
  cardNumber: "",
  cardStatus: "",
  gateIn: "",
  plateNumber: "",
  sessionId: "",
  timeIn: "",
  timeOut: "",
  vehicleType: "",
  imageInBodyUrl: "",
  imageInUrl: "",
  isClosed: false,
  cardId: "",
  sessionStatus: "",
};

const initSessionTable: SessionCard[] = [];

export const sessionSlice = createSlice({
  name: "session",
  initialState: initSessionCard,
  reducers: {
    setNewSessionInfo: (state, { payload }: PayloadAction<SessionCard>) => {
      Object.assign(state, JSON.parse(JSON.stringify(payload)));
    },
    resetSessionInfo: (state) => {
      Object.assign(state, JSON.parse(JSON.stringify(initSessionCard)));
    },
  },
});

export const sessionTableSlice = createSlice({
  name: "sessiontable",
  initialState: initSessionTable,
  reducers: {
    setNewTable: (state, { payload }: PayloadAction<SessionCard[]>) => {
      return [...payload];
    },
    setSessionTableItem: (state, { payload }: PayloadAction<SessionCard>) => {
      const newState = state.map((item) => {
        if (item.sessionId === payload.sessionId) {
          return { ...payload };
        }
        return item;
      });
      return [...newState];
    },
  },
});

export const { setNewTable, setSessionTableItem } = sessionTableSlice.actions;
export const sessionTableReducer = sessionTableSlice.reducer;

export const { setNewSessionInfo, resetSessionInfo } = sessionSlice.actions;
export default sessionSlice.reducer;
