import http from "@utils/http";
import {
  GET_VEHICLE_TYPES_API_URL,
  UPDATE_VEHICLE_TYPES_API_URL,
} from "./url/vehicle";
import { VehicleTypesResponse } from "@my_types/vehicle-type";
import { UpdateVehicleSchemaType } from "@utils/schema/updateVehicleSchema";

export const getVehicleTypesAPI = () =>
  http.get<VehicleTypesResponse>(GET_VEHICLE_TYPES_API_URL);

export const updateVehicleTypeAPI = (data: UpdateVehicleSchemaType) =>
  http.put(UPDATE_VEHICLE_TYPES_API_URL, data);
