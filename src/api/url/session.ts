import { Pagination } from "@my_types/pagination";
import baseAPI_URL from ".";

export type SessionParams = {
  pagination: Pagination;
  startDate?: string;
  endDate?: string;
  cardNum?: string;
  parkingId: string;
  plateNum?: string;
};

export const GET_SESSION_API_URL = ({
  pagination,
  startDate = "",
  endDate = "",
  cardNum = "",
  plateNum = "",
  parkingId,
}: SessionParams) =>
  `${baseAPI_URL}/session/${parkingId}?PageIndex=${
    pagination.pageIndex + 1
  }&PageSize=${
    pagination.pageSize
  }&StartDate=${startDate}&endDate=${endDate}&cardNum=${cardNum}&plateNum=${plateNum}`;

export const UPDATE_SESSION_PLATE_NUMBER_API_URL = `${baseAPI_URL}/session/session/platenumber`;

export const GET_SESSION_CARD_INFO_API_URL = (cardNumber: string) =>
  `${baseAPI_URL}/cards/${cardNumber}`;
