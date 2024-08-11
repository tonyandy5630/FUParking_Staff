import { CheckIn, UpdateVehicleTypeInfo } from "@my_types/check-in";
import { ErrorResponse, ResponseAPI } from "../types";
import http from "@utils/http";
import {
  CUSTOMER_CHECK_IN_API_URL,
  GUEST_CHECK_IN_API_URL,
} from "./url/check-in";

type CheckInType = "guest" | "customer";

export const CustomerCheckInAPI = (data: CheckIn) => {
  return http.post<ErrorResponse<UpdateVehicleTypeInfo>>(
    CUSTOMER_CHECK_IN_API_URL,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const GuestCheckInAPI = (data: CheckIn) => {
  return http.post(GUEST_CHECK_IN_API_URL, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
