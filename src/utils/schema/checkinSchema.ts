import { object, string, InferType, mixed } from "yup";
const CheckInSchema = object({
  CardId: string().required("Card id not present"),
  GateInId: string().trim(),
  PlateNumber: string(),
  ImageIn: mixed().optional(),
});

export type CheckInSchemaType = InferType<typeof CheckInSchema>;
export default CheckInSchema;
