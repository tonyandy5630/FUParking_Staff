import http from "@utils/http";
import { LICENSE_DETECT_API_URL } from "./url/license";
const TOKEN = import.meta.env.VITE_APLR_TOKEN;
export const licensePlateAPI = (data: any) =>
  http.post(LICENSE_DETECT_API_URL, data, {
    headers: {
      Authorization: `TOKEN ${TOKEN}`,
      "Content-Type": "multipart/form-data",
    },
  });
