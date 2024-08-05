import { UseFormGetValues } from "react-hook-form";
import { MAX_CARD_NUMBER_LENGTH, MIN_CARD_NUMBER_LENGTH } from "./check-in";
import { LENGTH_WARNING } from "@constants/auth.const";

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
});

export default getRules;
