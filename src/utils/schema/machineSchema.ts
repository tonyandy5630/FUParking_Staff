import { EMPTY_WARNING } from "@constants/auth.const";
import { InferType, object, string } from "yup";

const MachineSchema = object({
  code: string().trim().required(EMPTY_WARNING),
});

export type MachineSchemaType = InferType<typeof MachineSchema>;
export default MachineSchema;
