import http from "@utils/http";
import {
  GET_ALL_GATE_API_URL,
  GET_ALL_GATE_TYPES_API_URL,
  GET_GATE_BT_GATE_ID,
  GET_GATES_BY_PARKING_ID_API_URL,
} from "./url/gate";
import { ErrorResponse } from "@my_types/index";
import { Gate, GateOption, GateTypeOption } from "@my_types/gate";

export const getAllGateAPI = (parkingName?: string) =>
  http.get<ErrorResponse<GateOption[]>>(GET_ALL_GATE_API_URL(parkingName));

export const getAllGateTypeAPI = () =>
  http.get<ErrorResponse<GateTypeOption[]>>(GET_ALL_GATE_TYPES_API_URL);

export const getGateByParkingAreaIdAPI = (parkingId: string) =>
  http.get<ErrorResponse<Gate[]>>(GET_GATES_BY_PARKING_ID_API_URL(parkingId));

export const getGateByGateidAPI = (gateId: string) =>
  http.get<ErrorResponse<{ id: string }>>(GET_GATE_BT_GATE_ID(gateId));
