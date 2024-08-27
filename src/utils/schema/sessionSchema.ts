import { EMPTY_WARNING } from "@constants/auth.const";
import { InferType, object, string } from "yup";

export const updateSessionPlateNumberSchema = object({
  PlateNumber: string().trim().required(EMPTY_WARNING),
  SessionId: string().required(),
});

export type updateSessionPlateNumberSchemaType = InferType<
  typeof updateSessionPlateNumberSchema
>;
