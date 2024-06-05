import { ResponseAPI } from "../types";
import http from "@utils/http";
import { LOGIN_API_URL } from "./url/auth";
import { UserLogin } from "@my_types/auth";
import { ErrorResponse } from "react-router-dom";

export const loginAPI = (data: UserLogin) =>
  http.post<ResponseAPI<ErrorResponse>>(LOGIN_API_URL, data);
