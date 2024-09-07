import { CARD_NOT_INFO } from "@constants/message.const";
import { GENERAL_PLATE_NUMBER_REGEX } from "@constants/regex";

const REGION_ID_END_POSITION = 4;

// Function to format plate number
// eg: 4digit: 29A12345 -> 29A1 - 2345
// eg: 5digit: 29A123456 -> 29A1 - 234.56
// eg: 5digit electric: 29MĐ123456 -> 29MĐ1 - 234.56
export const formatPlateNumber = (plateNumber: string) => {
  const unformatPlate = unFormatPlateNumber(plateNumber);
  if (unformatPlate === CARD_NOT_INFO) {
    return "";
  }
  switch (unformatPlate.length) {
    case 8:
      return `${unformatPlate.substring(0, 4)}-${unformatPlate.substring(4)}`;
    case 9:
      return `${unformatPlate.substring(0, 4)}-${unformatPlate.substring(
        4,
        7
      )}.${unformatPlate.substring(7)}`;
    case 10:
      return `${unformatPlate.substring(0, 5)}-${unformatPlate.substring(
        5,
        8
      )}.${unformatPlate.substring(8)}`;
    default:
      return plateNumber;
  }
};

export const unFormatPlateNumber = (plate?: string) => {
  if (plate === undefined) return "";
  if (plate === "") return "";

  const plateHasDash = plate.includes("-");
  const plateHasDot = plate.includes(".");

  const isFormatPlateNumber = plateHasDash || plateHasDot;
  if (!isFormatPlateNumber) {
    return plate;
  }

  let unformattedPlate = "";
  let dashSplittedPlate = [];
  let dotSplittedPlate = [];

  if (plateHasDash) {
    dashSplittedPlate = plate.split("-");
    unformattedPlate = dashSplittedPlate.reduce(
      (previous, currentPart) => previous + currentPart,
      ""
    );
  }

  if (plateHasDot) {
    dotSplittedPlate = unformattedPlate.split(".");
    unformattedPlate = dotSplittedPlate.reduce(
      (previous, currentPart) => previous + currentPart,
      ""
    );
  }

  //* 2 parts in formatted plate number
  return unformattedPlate;
};

export const isValidPlateNumber = (plate?: string): boolean => {
  if (!plate || plate.trim().length === 0) {
    return false;
  }
  const match = plate.match(GENERAL_PLATE_NUMBER_REGEX);
  if (!match) return false;

  const [, , secondPart, thirdPart, decimalPart] = match;

  // If the second part is MD1, MD2, MĐ1, or MĐ2, the final part must be 5 digits
  if (/^M[ĐD][12]$/i.test(secondPart)) {
    return thirdPart.length === 5 && (!decimalPart || decimalPart.length === 2);
  }

  // For other cases, the final part can be 4, 5, or 6 digits, with an optional decimal if it's 5 or 6 digits
  return (
    thirdPart.length === 4 ||
    thirdPart.length === 5 ||
    (thirdPart.length === 6 && !decimalPart) ||
    (thirdPart.length === 5 &&
      decimalPart !== undefined &&
      decimalPart.length === 2)
  );
};
