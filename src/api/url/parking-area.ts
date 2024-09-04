import baseAPI_URL from ".";

export const GET_ALL_PARKING_AREA_API_URL = `${baseAPI_URL}/areas/option`;

export const GET_PARKING_AREA_STATISTIC_API_URL = (parkingId: string) =>
  `${baseAPI_URL}/statistic/parkingarea/${parkingId}/today`;

export type IncomeParams = {
  gate: string;
  startDate?: string;
  endDate?: string;
};

export const GET_GATE_INCOME_API_URL = ({
  gate = "",
  startDate = "",
  endDate = "",
}: IncomeParams) =>
  `${baseAPI_URL}/statistic/payment/${gate}/today?startDate=${startDate}&endDate=${endDate}`;
