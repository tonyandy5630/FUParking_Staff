import http from "@utils/http";
import { GET_VEHICLE_TYPES_API_URL } from "./url/vehicle";
import { VehicleTypesResponse } from "@my_types/vehicle-type";

export const getVehicleTypesAPI = () =>
  http.get<VehicleTypesResponse>(GET_VEHICLE_TYPES_API_URL);
