import { SessionStatus } from "@constants/session.const";

type SessionCard = {
  index?: number;
  cardId: string;
  cardNumber: string;
  plateNumber: string;
  cardStatus: string;
  sessionStatus?: string;
  sessionId: string;
  vehicleType: string;
  timeIn: string;
  timeOut?: string;
  gateIn: string;
  imageInUrl: string;
  imageInBodyUrl: string;
  isClosed: boolean;
};

export type CardInfo = {
  cardId: string;
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
  timeOut?: string;
  sessionId: string;
  sessionStatus: SessionStatus;
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
