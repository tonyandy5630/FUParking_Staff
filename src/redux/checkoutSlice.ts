import LANE from "@constants/lane.const";
import { CheckOutInfo } from "@my_types/check-out";
import LanePosition from "@my_types/lane";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export const initCheckOutInfo: CheckOutInfo = {
  id: "",
  plateImgIn: "",
  plateImgOut: "",
  bodyImgOut: "",
  plateTextIn: "",
  plateTextOut: "",
  cashToPay: 0,
  bodyImgIn: "",
  checkOutCardText: "",
  customerType: "",
  timeIn: "",
  timeOut: "",
  message: "",
  isError: false,
  croppedImagePlate: "",
};

const initialState = {
  left: initCheckOutInfo,
  right: initCheckOutInfo,
};

export const checkoutSlice = createSlice({
  name: "checkOutCardAction",
  initialState,
  reducers: {
    setNewCardInfo: (
      state,
      action: PayloadAction<{ lane: LanePosition; info: CheckOutInfo }>
    ) => {
      if (action.payload.lane === LANE.LEFT) {
        Object.assign(
          state.left,
          JSON.parse(JSON.stringify(action.payload.info))
        );
      } else if (action.payload.lane === LANE.RIGHT) {
        Object.assign(
          state.right,
          JSON.parse(JSON.stringify(action.payload.info))
        );
      }
    },
    resetCurrentCardInfo: (
      state,
      { payload }: PayloadAction<{ lane: LanePosition }>
    ) => {
      if (payload.lane === LANE.LEFT) {
        Object.assign(state.left, JSON.parse(JSON.stringify(initCheckOutInfo)));
      } else if (payload.lane === LANE.RIGHT) {
        Object.assign(
          state.right,
          JSON.parse(JSON.stringify(initCheckOutInfo))
        );
      }
    },
    setInfoMessage: (
      state,
      action: PayloadAction<{
        message: string;
        isError?: boolean;
        lane: LanePosition;
      }>
    ) => {
      if (action.payload.lane === LANE.LEFT) {
        state.left.message = action.payload.message;
        state.left.isError = action.payload.isError ?? false;
      } else if (action.payload.lane === LANE.RIGHT) {
        state.right.message = action.payload.message;
        state.right.isError = action.payload.isError ?? false;
      }
    },
  },
});

// Action creators are generated for each case reducer function
export const { setNewCardInfo, resetCurrentCardInfo, setInfoMessage } =
  checkoutSlice.actions;

export default checkoutSlice.reducer;
