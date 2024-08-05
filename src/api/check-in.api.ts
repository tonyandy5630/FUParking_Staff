import { CheckIn } from "@my_types/check-in";
import { ResponseAPI } from "../types";
import http from "@utils/http";
import {
  CUSTOMER_CHECK_IN_API_URL,
  GUEST_CHECK_IN_API_URL,
} from "./url/check-in";
import { ErrorResponse } from "react-router-dom";

type CheckInType = "guest" | "customer";

export const CustomerCheckInAPI = (data: CheckIn) => {
  return http.post<ErrorResponse>(CUSTOMER_CHECK_IN_API_URL, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const GuestCheckInAPI = (data: CheckIn) => {
  return http.post<ErrorResponse>(GUEST_CHECK_IN_API_URL, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
