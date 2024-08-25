import { ResponseAPI, SuccessResponse } from "../types";
import axios, { AxiosError, HttpStatusCode, type AxiosInstance } from "axios";
import { toast } from "react-toastify";
import { getTokenFromLS } from "./localStorage";
import { LICENSE_DETECT_API_URL } from "@apis/url/license";
import { CUSTOMER_NOT_EXIST_ERROR } from "@constants/error-message.const";
import baseAPI_URL from "@apis/url";

class Http {
  instance: AxiosInstance;
  private accessToken: string | null;
  constructor() {
    this.accessToken = getTokenFromLS();
    this.instance = axios.create({
      baseURL: baseAPI_URL ?? "",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.instance.interceptors.request.use(
      (config) => {
        if (config.url !== LICENSE_DETECT_API_URL)
          if (this.accessToken !== "" && config.headers) {
            config.headers.Authorization = `Bearer ${this.accessToken}`;
            return config;
          }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error: AxiosError) => {
        if (error.response?.status !== HttpStatusCode.UnprocessableEntity) {
          const data: any | undefined = error.response?.data;
          const message = data.message || error.message;
          // if (message !== CUSTOMER_NOT_EXIST_ERROR) {
          //   toast.error(message);
          // }
        }
        return Promise.reject(error);
      }
    );
  }
}

const http = new Http().instance;
export default http;
