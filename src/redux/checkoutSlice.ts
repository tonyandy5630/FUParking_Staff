import { CheckOutInfo } from "@my_types/check-out";
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

export const checkoutSlice = createSlice({
  name: "checkOutCardAction",
  initialState: initCheckOutInfo,
  reducers: {
    setNewCardInfo: (state, action: PayloadAction<CheckOutInfo>) => {
      Object.assign(state, JSON.parse(JSON.stringify(action.payload)));
    },
    resetCurrentCardInfo: (state) => {
      Object.assign(state, JSON.parse(JSON.stringify(initCheckOutInfo)));
    },
    setInfoMessage: (
      state,
      action: PayloadAction<{ message: string; isError?: boolean }>
    ) => {
      state.message = action.payload.message;
      state.isError = action.payload.isError ?? false;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setNewCardInfo, resetCurrentCardInfo, setInfoMessage } =
  checkoutSlice.actions;

export default checkoutSlice.reducer;
