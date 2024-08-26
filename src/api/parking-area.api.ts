import http from "@utils/http";
import {
  GET_ALL_PARKING_AREA_API_URL,
  GET_PARKING_AREA_STATISTIC_API_URL,
} from "./url/parking-area";
import { ErrorResponse, SuccessResponse } from "@my_types/index";
import { ParkingAreaOption, ParkingStatistic } from "@my_types/parking-area";

export const getAllParkingAreaAPI = () =>
  http.get<ErrorResponse<ParkingAreaOption[]>>(GET_ALL_PARKING_AREA_API_URL);

export const getParkingAreaStatisticAPI = (parkingId: string) =>
  http.get<SuccessResponse<ParkingStatistic>>(
    GET_PARKING_AREA_STATISTIC_API_URL(parkingId)
  );
