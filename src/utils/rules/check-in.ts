import { LENGTH_WARNING } from "@constants/auth.const";
import { UseFormGetValues } from "react-hook-form";

export const MAX_CARD_NUMBER_LENGTH = 11;
export const MIN_CARD_NUMBER_LENGTH = 5;

const MIN_PLATE_NUMBER_LENGTH = 9;
const MAX_PLATE_NUMBER_LENGTH = 10;

const PLATE_NUMBER_REGEX =
  /^(\d{2}[A-Z]{1}\d{1,2}\d{4,5}|\d{2}[A-Z]{2}\d{1,2}-\d{4,5})$/;

const getRules = (getValues?: UseFormGetValues<any>) => ({
  cardNumber: {
    maxLength: {
      value: MAX_CARD_NUMBER_LENGTH,
      message: LENGTH_WARNING(MIN_CARD_NUMBER_LENGTH, MAX_CARD_NUMBER_LENGTH),
    },
    minLength: {
      value: MIN_CARD_NUMBER_LENGTH,
      message: LENGTH_WARNING(MIN_CARD_NUMBER_LENGTH, MAX_CARD_NUMBER_LENGTH),
    },
  },
  plateNumber: {
    pattern: {
      value: PLATE_NUMBER_REGEX,
      message: "Not a valid plate number",
    },
    minLength: {
      value: MIN_PLATE_NUMBER_LENGTH,
      message: LENGTH_WARNING(MIN_PLATE_NUMBER_LENGTH, MAX_PLATE_NUMBER_LENGTH),
    },
    maxLength: {
      value: MAX_CARD_NUMBER_LENGTH,
      message: LENGTH_WARNING(MIN_PLATE_NUMBER_LENGTH, MAX_PLATE_NUMBER_LENGTH),
    },
  },
});

export default getRules;
