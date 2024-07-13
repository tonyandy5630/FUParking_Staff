import http from "@utils/http";
import { LICENSE_DETECT_API_URL } from "./url/license";

export const licensePlateAPI = (data: any) =>
  http.post(LICENSE_DETECT_API_URL, data, {
    headers: {
      Authorization: "Token " + "af415b41053f5b7164cda31be08d4f3c97d5099c",
      "Content-Type": "multipart/form-data",
    },
  });
