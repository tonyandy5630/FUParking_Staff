import { ErrorResponse } from ".";

export type CheckOut = {
  CardNumber?: string;
  GateOutId?: string;
  TimeOut?: Date;
  ImageOut?: any;
  PlateNumber?: string;
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

export type ResponseCheckOut = ErrorResponse<CheckOutResponse>;
