import { object, string, InferType, mixed } from "yup";
import { EMPTY_WARNING } from "@constants/auth.const";
import getRules from "@utils/rules/check-in";

const { cardNumber, plateNumber } = getRules();

const CheckInSchema = object({
  cardNumber: string()
    .trim()
    .required(EMPTY_WARNING)
    .min(cardNumber.minLength.value, cardNumber.minLength.message)
    .max(cardNumber.maxLength.value, cardNumber.maxLength.message),
  gateInId: string().trim().required(EMPTY_WARNING),
  plateNumber: string()
    .required(EMPTY_WARNING)
    .min(plateNumber.minLength.value, plateNumber.minLength.message)
    .max(plateNumber.maxLength.value, plateNumber.maxLength.message)
    .matches(plateNumber.pattern.value, plateNumber.pattern.message),
  imageIn: mixed().required("Thiếu ảnh xe vào"),
});

export type CheckInSchema = InferType<typeof CheckInSchema>;
export default CheckInSchema;
