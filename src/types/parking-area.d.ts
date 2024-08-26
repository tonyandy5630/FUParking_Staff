export type ParkingAreaOption = {
  id: string;
  name: string;
  description?: string;
};

export type ParkingStatistic = {
  totalCheckInToday: number;
  totalCheckOutToday: number;
  totalVehicleParked: number;
  totalLot: number;
};
