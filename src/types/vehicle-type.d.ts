import { ErrorResponse, SuccessResponse } from ".";

export type VehicleType = {
  id: string;
  name: string;
};

export type VehicleTypesResponse = SuccessResponse<Array<VehicleType>>;
