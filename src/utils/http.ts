import { ResponseAPI, SuccessResponse } from "../types/index.types";
import axios, { AxiosError, HttpStatusCode, type AxiosInstance } from "axios";
import { toast } from "react-toastify";

class Http {
  instance: AxiosInstance;
  private accessToken: string;
  constructor() {
    this.accessToken = "";
    this.instance = axios.create({
      baseURL: "https://api.quotable.io/random",
      timeout: 10000,
      //   withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.instance.interceptors.request.use(
      (config) => {
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
          toast.error(message);
        }
        return Promise.reject(error);
      }
    );
  }
}

const http = new Http().instance;
export default http;
