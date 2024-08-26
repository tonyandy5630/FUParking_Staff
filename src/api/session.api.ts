import { SuccessResponse } from "@my_types/index";
import { Pagination } from "@my_types/pagination";
import { ParkingCard } from "@my_types/session-card";
import http from "@utils/http";
import { GET_SESSION_API_URL } from "./url/session";

export const getParkingSession = (pagination: Pagination) =>
  http.get<SuccessResponse<ParkingCard[]>>(GET_SESSION_API_URL(pagination));
