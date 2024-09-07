import { EMAIL_REGEX, LENGTH_WARNING } from "@constants/auth.const";
import { UseFormGetValues } from "react-hook-form";

const MIN_EMAIL = 2;
const MAX_EMAIL = 30;

const MIN_NAME = 2;
const MAX_NAME = 50;
const NAME_LENGTH_WARNING = LENGTH_WARNING(MIN_NAME, MAX_NAME);

const MIN_PWD = 6;
const MAX_PWD = 50;

const PHONE_REGEX = /^0\d{9}$/;

const getRules = (getValues?: UseFormGetValues<any>) => ({
  email: {
    pattern: {
      value: EMAIL_REGEX,
      message: `Sai định dạng email`,
    },
  },
  name: {
    maxLength: {
      value: MAX_NAME,
      message: NAME_LENGTH_WARNING,
    },
    minLength: {
      value: MIN_NAME,
      message: NAME_LENGTH_WARNING,
    },
  },
  rePwd: {
    validate:
      typeof getValues === "function"
        ? (value: string) =>
            value === getValues("pwd") || "Confirm password not matched"
        : undefined,
  },
});

export default getRules;
