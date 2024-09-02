import {
  CheckIn,
  CheckInCustomerInfo,
  UpdateVehicleTypeInfo,
} from "@my_types/check-in";
import { ErrorResponse, ResponseAPI } from "../types";
import http from "@utils/http";
import {
  CUSTOMER_CHECK_IN_API_URL,
  GET_CUSTOMER_TYPE_CHECK_IN_API_URL,
  GUEST_CHECK_IN_API_URL,
} from "./url/check-in";
import { CheckInSchemaType } from "@utils/schema/checkinSchema";

type CheckInType = "guest" | "customer";

export const CustomerCheckInAPI = (data: CheckInSchemaType) => {
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

export const GuestCheckInAPI = (data: CheckInSchemaType) => {
  return http.post(GUEST_CHECK_IN_API_URL, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getCustomerTypeCheckInAPI = (plateNumber: string) =>
  http.get<ErrorResponse<CheckInCustomerInfo>>(
    GET_CUSTOMER_TYPE_CHECK_IN_API_URL(plateNumber)
  );
