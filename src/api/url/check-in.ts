import baseAPI_URL from ".";

export const GUEST_CHECK_IN_API_URL = `${baseAPI_URL}/session/guest/checkin`;
export const CUSTOMER_CHECK_IN_API_URL = `${baseAPI_URL}/session/checkin`;

export const GET_CUSTOMER_TYPE_CHECK_IN_API_URL = (plateNumber: string) =>
  `${baseAPI_URL}/session/customerType/${plateNumber}`;
