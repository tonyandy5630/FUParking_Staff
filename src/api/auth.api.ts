import { ErrorResponse, ResponseAPI } from "../types";
import http from "@utils/http";
import { LOGIN_API_URL } from "./url/auth";
import { User, UserLogin } from "@my_types/auth";

export const loginAPI = (data: UserLogin) =>
  http.post<ErrorResponse<User>>(LOGIN_API_URL, data);
