import { ErrorResponse } from "react-router-dom";

export type UserLogin = {
  email: string;
  password: string;
};

type User = {
  bearerToken: string;
  Name: string;
  Email: string;
  Role: string;
};

export type UserResponse = ErrorResponse<User>;
