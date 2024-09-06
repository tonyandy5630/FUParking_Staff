import { CustomerType } from "@constants/customer.const";
import { VehicleStatus } from "./vehicle";
import { CardInfo } from "./session-card";

export type CheckIn = {
  CardId: string;
  GateInId: string;
  PlateNumber: string;
  ImageIn: any;
  ImageBodyIn: any;
  VehicleTypeId?: string;
};

export type UpdateVehicleTypeInfo = {
  createDate: string;
  plateNumber: string;
  vehicleType: string;
  statusVehicle: string;
  plateImage: string;
};

export type CheckInCustomerInfo = {
  customerType: CustomerType;
  previousSessionInfo: {
    cardOrPlateNumber: "CARD" | "PLATENUMBER";
  } | null;
  informationVehicle: UpdateVehicleTypeInfo | null;
};
