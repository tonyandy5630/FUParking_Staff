export type ResponseAPI<Data> = {
  message?: string;
  data?: Data;
};

export type SuccessResponse<Data> = {
  message?: string;
  data: Data;
};

export type ErrorResponse<Data> = {
  message?: string;
  data?: Data;
};

export type ErrorResponseAPI = {
  data?: any;
  message: string;
  totalRecord?: number;
  internalErrorMessage?: string;
  isSuccess: boolean;
};
