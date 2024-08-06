import { ErrorResponse } from ".";

export type CheckOut = {
  CardNumber?: string;
  GateOutId?: string;
  TimeOut?: Date;
  ImageOut?: any;
};

export type CheckOutResponse = {
  data: {
    amount: number;
    imageIn: string;
    message: string;
    plateNumber: string;
  };
};

export type ResponseCheckOut = ErrorResponse<CheckOutResponse>;
