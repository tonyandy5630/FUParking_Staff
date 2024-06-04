import { ResponseAPI } from "../types/index.types";
import http from "@utils/http";

export const demoAPI = () =>
  http.get<ResponseAPI<any>>("https://api.quotable.io/random");
