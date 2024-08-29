import baseAPI_URL from ".";

export const CHECK_OUT_GUEST_API_URL = `${baseAPI_URL}/session/checkout`;
export const CHECK_OUT_PAYMENT_API_URL = `${baseAPI_URL}/session/payment`;

export const GET_CARD_CHECK_OUT_API_URL = (
  cardNumber: string,
  timeOut: string
) => `${baseAPI_URL}/session/card/${cardNumber}&${timeOut}`;

export const MISSING_CARD_CHECKOUT_API_URL = `${baseAPI_URL}/session/checkout/plateNumber`;

export const GET_CARD_CHECK_OUT_BY_PLATE_API_URL = (
  plateNumber: string,
  timeOut: string
) => `${baseAPI_URL}/session/platenumber/${plateNumber}&${timeOut}`;
