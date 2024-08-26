import { EMPTY_WARNING } from "@constants/auth.const";
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

export const MissingCardCheckOutSchema = object({
  GateId: string().trim(),
  CheckOutTime: date(),
  ImageBody: mixed(),
  PlateNumber: string().trim().required(EMPTY_WARNING),
  ImagePlate: mixed(),
});

export type MissingCardCheckOutSchemaType = InferType<
  typeof MissingCardCheckOutSchema
>;
