const DEV_API_URL = import.meta.env.VITE_DEV_SERVER_API_URL;
const PROD_API_URL = import.meta.env.VITE_SERVER_URL;
const LOCAL_PROD_API_URL = import.meta.env.VITE_LOCAL_SERVER_URL;

const baseAPI_URL =
  process.env.NODE_ENV === "development" ? DEV_API_URL : PROD_API_URL;

export default baseAPI_URL as string;
