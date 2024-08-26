type SessionCard = {
  cardNumber: string;
  plateNumber: string;
  cardStatus: string;
  sessionId: string;
  vehicleType: string;
  timeIn: string;
  gateIn: string;
};

type ParkingSession = {
  sessionId: string;
  gateIn: string;
  plateNumber: string;
  imageInUrl: string;
  imageInBodyUrl: string;
  timeIn: string;
  vehicleType: string;
  customerEmail: string;
  staffCheckInEmail: string;
};

export type ParkingCard = {
  id: string;
  cardNumber: string;
  plateNumber: string;
  createdDate: string;
  status: string;
  session: ParkingSession;
  isInUse: boolean;
};
