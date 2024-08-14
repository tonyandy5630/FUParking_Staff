import { object, string, InferType, mixed, date } from "yup";

const CheckOutSchema = object({
  CardNumber: string().trim(),
  GateOutId: string().trim(),
  TimeOut: date(),
  ImageOut: mixed(),
  PlateNumber: string().trim(),
});

export type CheckOutSchemaType = InferType<typeof CheckOutSchema>;
export default CheckOutSchema;
