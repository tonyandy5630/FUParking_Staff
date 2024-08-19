import http from "@utils/http";
import { GET_ALL_PARKING_AREA_API_URL } from "./url/parking-area";
import { ErrorResponse } from "@my_types/index";
import { ParkingAreaOption } from "@my_types/parking-area";

export const getAllParkingAreaAPI = () =>
  http.get<ErrorResponse<ParkingAreaOption[]>>(GET_ALL_PARKING_AREA_API_URL);
