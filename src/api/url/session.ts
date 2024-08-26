import { Pagination } from "@my_types/pagination";
import baseAPI_URL from ".";

export const GET_SESSION_API_URL = (pagination: Pagination) =>
  `${baseAPI_URL}/cards?PageIndex=${pagination.pageIndex}&PageSize=${pagination.pageSize}`;
