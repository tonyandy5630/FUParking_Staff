type SessionCard = {
  index?: number;
  cardNumber: string;
  plateNumber: string;
  cardStatus: string;
  sessionId: string;
  vehicleType: string;
  timeIn: string;
  gateIn: string;
  imageInUrl: string;
  imageInBodyUrl: string;
  isClosed: boolean;
};

export type CardInfo = {
  cardNumber: string;
  plateNumber: string;
  status: string;
  sessionPlateNumber: string;
  sessionVehicleType: string;
  sessionTimeIn: string;
  sessionGateIn: string;
  sessionCustomerName: string;
  sessionCustomerEmail: string;
  imageInUrl: string;
  imageInBodyUrl: string;
  sessionId: string;
};

export type Session = {
  id: string;
  cardNumber: string;
  gateInName: string;
  gateOutName: string;
  plateNumber: string;
  imageInUrl: string;
  imageOutUrl: string;
  timeIn: string;
  timeOut?: string;
  mode: string;
  block: number;
  vehicleTypeName: string;
  paymentMethodName: string;
  customerEmail: string;
  status: string;
  imageInBodyUrl: string;
  imageOutBodyUrl: string;
};
