export type CheckIn = {
  CardId?: string;
  GateInId?: string;
  PlateNumber?: string;
  ImageIn?: any;
  VehicleTypeId?: string;
};

export type UpdateVehicleTypeInfo = {
  createDate: string;
  plateNumber: string;
  vehicleType: string;
  statusVehicle: string;
  plateImage: string;
};
