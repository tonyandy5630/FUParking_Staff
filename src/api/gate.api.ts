import http from "@utils/http";
import { GET_ALL_GATE_API_URL, GET_ALL_GATE_TYPES_API_URL } from "./url/gate";
import { ErrorResponse } from "@my_types/index";
import { GateOption, GateTypeOption } from "@my_types/gate";

export const getAllGateAPI = (parkingName?: string) =>
  http.get<ErrorResponse<GateOption[]>>(GET_ALL_GATE_API_URL(parkingName));

export const getAllGateTypeAPI = () =>
  http.get<ErrorResponse<GateTypeOption[]>>(GET_ALL_GATE_TYPES_API_URL);
