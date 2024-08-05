import { object, string, InferType, mixed } from "yup";
import { EMPTY_WARNING } from "@constants/auth.const";
import getRules from "@utils/rules/check-in";

const { cardNumber, plateNumber } = getRules();

const CheckInSchema = object({
  CardNumber: string().trim(),
  // .required(EMPTY_WARNING)
  // .min(cardNumber.minLength.value, cardNumber.minLength.message)
  // .max(cardNumber.maxLength.value, cardNumber.maxLength.message),
  GateInId: string().trim().required(EMPTY_WARNING),
  PlateNumber: string(),
  // .required(EMPTY_WARNING)
  // .min(plateNumber.minLength.value, plateNumber.minLength.message)
  // .max(plateNumber.maxLength.value, plateNumber.maxLength.message)
  // .matches(plateNumber.pattern.value, plateNumber.pattern.message)
  ImageIn: mixed(),
});

export type CheckInSchema = InferType<typeof CheckInSchema>;
export default CheckInSchema;
