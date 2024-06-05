import { ErrorResponse } from "@my_types/index";
import { MachineCode } from "@my_types/machine";
import http from "@utils/http";
import { CHANGE_MACHINE_CODE_API_URL } from "./url/machine";

export const changeMachineCodeAPI = (data: MachineCode) =>
  http.post<ErrorResponse<MachineCode>>(CHANGE_MACHINE_CODE_API_URL, data);
