import { EMPTY_WARNING } from "@constants/auth.const";
import { object, string, InferType, mixed, boolean } from "yup";
const UpdateVehicleSchema = object({
  vehicleType: string().required(EMPTY_WARNING),
  plateNumber: string(),
  isAccept: boolean(),
});

export type UpdateVehicleSchemaType = InferType<typeof UpdateVehicleSchema>;
export default UpdateVehicleSchema;
