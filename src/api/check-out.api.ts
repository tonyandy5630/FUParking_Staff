import http from "@utils/http";
import {
  CHECK_OUT_GUEST_API_URL,
  CHECK_OUT_PAYMENT_API_URL,
  GET_CARD_CHECK_OUT_API_URL,
} from "./url/check-out";
import { ErrorResponse } from "@my_types/index";
import { CheckOut, CheckOutCardInfo } from "@my_types/check-out";

export const checkOutAPI = (data: CheckOut) =>
  http.post(CHECK_OUT_GUEST_API_URL, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const checkOutPaymentAPI = (CardNumber: string) =>
  http.post(CHECK_OUT_PAYMENT_API_URL + "?CardNumber=" + CardNumber);

export const getCardCheckOutAPI = (cardNumber: string) =>
  http.get<ErrorResponse<CheckOutCardInfo>>(
    GET_CARD_CHECK_OUT_API_URL(cardNumber)
  );
