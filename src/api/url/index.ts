const DEV_API_URL = "https://localhost:7041/api";
const PROD_API_URL = "https://backend.khangbpa.com/api";

const baseAPI_URL =
  process.env.NODE_ENV === "development" ? DEV_API_URL : PROD_API_URL;

export default baseAPI_URL as string;
