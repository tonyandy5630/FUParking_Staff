import { MOTORBIKE_PLATE_NUMBER_REGEX } from "@constants/regex";
import { UseFormGetValues } from "react-hook-form";

const getSessionRules = (getValues?: UseFormGetValues<any>) => ({
  PlateNumber: {
    pattern: {
      value: MOTORBIKE_PLATE_NUMBER_REGEX,
      message: "Biển số không hợp lệ",
    },
  },
});

export default getSessionRules;
