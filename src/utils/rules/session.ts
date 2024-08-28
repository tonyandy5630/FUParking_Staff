import { PLATE_NUMBER_REGEX } from "@constants/regex";
import { UseFormGetValues } from "react-hook-form";

const getSessionRules = (getValues?: UseFormGetValues<any>) => ({
  PlateNumber: {
    pattern: {
      value: PLATE_NUMBER_REGEX,
      message: "Not a valid plate number",
    },
  },
});

export default getSessionRules;
