import { CARD_NOT_INFO } from "@constants/message.const";
import {
  ELECTRIC_PLATE_NUMBER_REGEX,
  MOTORBIKE_PLATE_NUMBER_REGEX,
} from "@constants/regex";

const REGION_ID_END_POSITION = 4;

// export const formatPlateNumber = (plate?: string): string => {
//   if (!plate) return CARD_NOT_INFO;

//   const regionId = plate.substring(0, REGION_ID_END_POSITION);
//   const remains = plate.substring(REGION_ID_END_POSITION);

//   return `${regionId}-${remains}`;
// };
// Function to format plate number
// eg: 4digit: 29A12345 -> 29A1 - 2345
// eg: 5digit: 29A123456 -> 29A1 - 234.56
// eg: 5digit electric: 29MĐ123456 -> 29MĐ1 - 234.56
export const formatPlateNumber = (plateNumber: string) => {
  switch (plateNumber.length) {
    case 8:
      return `${plateNumber.substring(0, 4)}-${plateNumber.substring(4)}`;
    case 9:
      return `${plateNumber.substring(0, 4)}-${plateNumber.substring(
        4,
        7
      )}.${plateNumber.substring(7)}`;
    case 10:
      return `${plateNumber.substring(0, 5)}-${plateNumber.substring(
        5,
        8
      )}.${plateNumber.substring(8)}`;
    default:
      return plateNumber;
  }
};

export const unFormatPlateNumber = (plate?: string) => {
  if (!plate) return CARD_NOT_INFO;

  const plateAfterSplit = plate.split("-");
  //* 2 parts in formatted plate number
  return plateAfterSplit[0] + plateAfterSplit[1];
};

export const isValidPlateNumber = (plate?: string): boolean => {
  if (!plate || plate.trim().length === 0) {
    return false;
  }
  const isElectricPlate = ELECTRIC_PLATE_NUMBER_REGEX.test(plate);
  const isOtherPlate = MOTORBIKE_PLATE_NUMBER_REGEX.test(plate);

  //* true if one the the 2 regex is matched
  return isElectricPlate || isOtherPlate;
};
