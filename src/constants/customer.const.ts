export const SYSTEM_CUSTOMER = "KHÁCH HÀNG";
export const APP_CUSTOMER = "Khách hàng hệ thống";
export const GUEST = "KHÁCH VÃNG LAI";
export const NEXT_CUSTOMER = "KHÁCH HÀNG TIẾP THEO";

export type GuestTypeMessage = typeof SYSTEM_CUSTOMER | typeof GUEST;

export const PAID_CUSTOMER = "PAID";
export const GUEST_CUSTOMER = "GUEST";
export const FREE_CUSTOMER = "FREE";

export type CustomerType =
  | typeof PAID_CUSTOMER
  | typeof GUEST_CUSTOMER
  | typeof FREE_CUSTOMER;
