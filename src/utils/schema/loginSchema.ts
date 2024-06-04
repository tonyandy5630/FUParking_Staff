import { object, string, InferType } from "yup";
import getRules from "../rules/auth";
import { EMPTY_WARNING } from "@constants/auth.const";

const rules = getRules();

const UserSchema = object({
  email: string()
    .trim()
    .min(rules.email.minLength.value, rules.email.minLength.message)
    .max(rules.email.maxLength.value, rules.email.maxLength.message)
    .email("Not an email")
    .required(EMPTY_WARNING),
  password: string().trim().min(1).max(20).required(EMPTY_WARNING),
});

export type UserSchemaType = InferType<typeof UserSchema>;
export default UserSchema;
