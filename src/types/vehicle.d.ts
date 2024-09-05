import { ACTIVE_VEHICLE, PENDING_VEHICLE } from "@constants/vehicle.const";

export type VehicleStatus = typeof PENDING_VEHICLE | typeof ACTIVE_VEHICLE;
