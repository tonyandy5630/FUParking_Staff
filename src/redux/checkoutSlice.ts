import { DEFAULT_GUEST } from "@constants/customer.const";
import { CheckOutInfo } from "@my_types/check-out";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const initialState: CheckOutInfo = {
  plateImgIn: "",
  plateImgOut: "",
  bodyImgOut: "",
  plateTextIn: "",
  plateTextOut: "",
  cashToPay: 0,
  bodyImgIn: "",
  checkOutCardText: "",
  customerType: DEFAULT_GUEST,
  needPay: false,
  timeIn: undefined,
  timeOut: undefined,
  message: "",
  isError: false,
};

export const checkoutSlice = createSlice({
  name: "checkOutCardAction",
  initialState,
  reducers: {
    setNewCardInfo: (state, action: PayloadAction<CheckOutInfo>) => {
      Object.assign(state, JSON.parse(JSON.stringify(action.payload)));
    },
    resetCurrentCardInfo: (state) => {
      Object.assign(state, JSON.parse(JSON.stringify(initialState)));
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
