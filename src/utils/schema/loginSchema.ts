import { object, string, InferType } from "yup";
import getRules from "../rules/auth";
import { EMPTY_WARNING } from "@constants/auth.const";

const rules = getRules();

const UserSchema = object({
  email: string().trim().email("Sai định dạng email").required(EMPTY_WARNING),
  password: string().trim().required(EMPTY_WARNING),
});

export type UserSchemaType = InferType<typeof UserSchema>;
export default UserSchema;
