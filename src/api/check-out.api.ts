import http from "@utils/http";
import {
  CHECK_OUT_GUEST_API_URL,
  CHECK_OUT_PAYMENT_API_URL,
  GET_CARD_CHECK_OUT_API_URL,
  GET_CARD_CHECK_OUT_BY_PLATE_API_URL,
  MISSING_CARD_CHECKOUT_API_URL,
} from "./url/check-out";
import { ErrorResponse } from "@my_types/index";
import {
  CheckOut,
  CheckOutCardInfo,
  MissingCardCheckOut,
} from "@my_types/check-out";

export const checkOutAPI = (data: CheckOut) =>
  http.post(CHECK_OUT_GUEST_API_URL, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const checkOutPaymentAPI = (CardNumber: string) =>
  http.post(CHECK_OUT_PAYMENT_API_URL + "?CardNumber=" + CardNumber);

export const getCardCheckOutAPI = (cardNumber: string, timeOut: string) =>
  http.get<ErrorResponse<CheckOutCardInfo>>(
    GET_CARD_CHECK_OUT_API_URL(cardNumber, timeOut)
  );

export const missingCardCheckOutAPI = (body: MissingCardCheckOut) =>
  http.put(MISSING_CARD_CHECKOUT_API_URL, body, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getCardCheckOutInfoByPlateAPI = (
  plateNumber: string,
  timeOut: string
) =>
  http.get<ErrorResponse<CheckOutCardInfo>>(
    GET_CARD_CHECK_OUT_BY_PLATE_API_URL(plateNumber, timeOut)
  );
