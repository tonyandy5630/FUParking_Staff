import { object, string, InferType, mixed, date } from "yup";

const CheckOutSchema = object({
  CardNumber: string().trim(),
  GateOutId: string().trim(),
  TimeOut: date(),
  ImageOut: mixed(),
});

export type CheckOutSchema = InferType<typeof CheckOutSchema>;
export default CheckOutSchema;
