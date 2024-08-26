import { CARD_NOT_INFO } from "@constants/message.const";

const REGION_ID_END_POSITION = 4;

export const formatPlateNumber = (plate?: string): string => {
  if (!plate) return CARD_NOT_INFO;

  const regionId = plate.substring(0, REGION_ID_END_POSITION);
  const remains = plate.substring(REGION_ID_END_POSITION);

  return `${regionId}-${remains}`;
};
