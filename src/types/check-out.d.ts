import { ErrorResponse } from ".";

export type MissingCardCheckOut = {
  PlateNumber: string;
  CheckOutTime: string;
  ImagePlate: any;
  ImageBody: any;
  GateId: string;
};

export type CheckOut = {
  CardNumber: string;
  GateOutId?: string;
  TimeOut?: Date;
  ImageOut?: any;
  PlateNumber?: string;
};

export type CheckOutInfo = {
  id: string;
  plateImgIn: string;
  plateImgOut: string;
  bodyImgIn: string;
  bodyImgOut: string;
  plateTextIn: string;
  plateTextOut: string;
  cashToPay?: number;
  checkOutCardText: string;
  customerType: string;
  needPay: boolean;
  timeIn?: string;
  timeOut?: string;
  message: string;
  isError?: boolean;
  croppedImagePlate: string;
};

export type CheckOutResponse = {
  data: {
    amount: number;
    imageIn: string;
    message: string;
    plateNumber: string;
    timeIn: string;
    typeOfCustomer: string;
  };
};

export type CheckOutCardInfo = {
  id: string;
  cardId: string;
  gateIn: string;
  gateOut: string;
  plateNumber: string;
  imageInUrl: string;
  imageInBodyUrl: string;
  timeIn: string;
  vehicleType: string;
  isEnoughToPay: boolean | null;
  status: string;
  amount: number;
};

export type ResponseCheckOut = ErrorResponse<CheckOutResponse>;
