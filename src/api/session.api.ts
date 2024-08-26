import { SuccessResponse } from "@my_types/index";
import { Pagination } from "@my_types/pagination";
import { Session } from "@my_types/session-card";
import http from "@utils/http";
import { GET_SESSION_API_URL, SessionParams } from "./url/session";

export const getParkingSession = (params: SessionParams) =>
  http.get<SuccessResponse<Session[]>>(GET_SESSION_API_URL(params));
