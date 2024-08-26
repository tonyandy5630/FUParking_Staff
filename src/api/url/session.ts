import { Pagination } from "@my_types/pagination";
import baseAPI_URL from ".";

export type SessionParams = {
  pagination: Pagination;
  startDate?: string;
  endDate?: string;
  cardNum?: string;
  parkingId: string;
};

export const GET_SESSION_API_URL = ({
  pagination,
  startDate = "",
  endDate = "",
  cardNum = "",
  parkingId,
}: SessionParams) =>
  `${baseAPI_URL}/session/${parkingId}?PageIndex=${pagination.pageIndex}&PageSize=${pagination.pageSize}&StartDate=${startDate}&endDate=${endDate}&cardNum=${cardNum}`;
