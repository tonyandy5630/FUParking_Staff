import { EMAIL_REGEX, LENGTH_WARNING } from "@constants/auth.const";
import { UseFormGetValues } from "react-hook-form";

const MIN_EMAIL = 2;
const MAX_EMAIL = 30;
const EMAIL_LENGTH_WARNING = LENGTH_WARNING(MIN_EMAIL, MAX_EMAIL);

const MIN_NAME = 2;
const MAX_NAME = 50;
const NAME_LENGTH_WARNING = LENGTH_WARNING(MIN_NAME, MAX_NAME);

const MIN_PWD = 6;
const MAX_PWD = 50;
const PWD_LENGTH_WARNING = LENGTH_WARNING(MIN_PWD, MAX_PWD);

const PHONE_REGEX = /^0\d{9}$/;

const getRules = (getValues?: UseFormGetValues<any>) => ({
  email: {
    pattern: {
      value: EMAIL_REGEX,
      message: `Not a valid email format`,
    },
    minLength: {
      value: MIN_EMAIL,
      message: EMAIL_LENGTH_WARNING,
    },
    maxLength: {
      value: MAX_EMAIL,
      message: EMAIL_LENGTH_WARNING,
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
  pwd: {
    minLength: {
      value: MIN_PWD,
      message: PWD_LENGTH_WARNING,
    },
    maxLength: {
      value: MAX_PWD,
      message: PWD_LENGTH_WARNING,
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
