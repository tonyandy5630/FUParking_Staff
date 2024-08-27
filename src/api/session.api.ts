import { updateSessionPlateNumberSchemaType } from "./../utils/schema/sessionSchema";
import { ErrorResponse, SuccessResponse } from "@my_types/index";
import { Pagination } from "@my_types/pagination";
import { CardInfo, Session } from "@my_types/session-card";
import http from "@utils/http";
import {
  GET_SESSION_API_URL,
  GET_SESSION_CARD_INFO_API_URL,
  SessionParams,
  UPDATE_SESSION_PLATE_NUMBER_API_URL,
} from "./url/session";

export const getParkingSession = (params: SessionParams) =>
  http.get<SuccessResponse<Session[]>>(GET_SESSION_API_URL(params));

export const updateSessionPlateNumberAPI = (
  data: updateSessionPlateNumberSchemaType
) =>
  http.put(UPDATE_SESSION_PLATE_NUMBER_API_URL, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getCardSessionInfoAPI = (cardNumber: string) =>
  http.get<ErrorResponse<CardInfo>>(GET_SESSION_CARD_INFO_API_URL(cardNumber));
