import { CheckIn } from "@my_types/check-in";
import { ResponseAPI } from "../types";
import http from "@utils/http";
import { CUSTOMER_CHECK_IN_API_URL } from "./url/check-in";
import { ErrorResponse } from "react-router-dom";

export const customerCheckInAPI = (data: CheckIn) =>
  http.post<ErrorResponse>(CUSTOMER_CHECK_IN_API_URL, data);
