import baseAPI_URL from ".";

export const GET_ALL_PARKING_AREA_API_URL = `${baseAPI_URL}/areas/option`;

export const GET_PARKING_AREA_STATISTIC_API_URL = (parkingId: string) =>
  `${baseAPI_URL}/statistic/parkingarea/${parkingId}/today`;
