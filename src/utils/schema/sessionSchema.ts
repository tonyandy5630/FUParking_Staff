import { EMPTY_WARNING } from "@constants/auth.const";
import getSessionRules from "@utils/rules/session";
import { InferType, object, string } from "yup";

const { PlateNumber } = getSessionRules();
export const updateSessionPlateNumberSchema = object({
  PlateNumber: string()
    .trim()
    .required(EMPTY_WARNING)
    .matches(PlateNumber.pattern.value, PlateNumber.pattern.message),
  SessionId: string().required(),
});

export type updateSessionPlateNumberSchemaType = InferType<
  typeof updateSessionPlateNumberSchema
>;
