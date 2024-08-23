export const SYSTEM_CUSTOMER = "KHÁCH HÀNG SỬ DỤNG APP";
export const GUEST = "KHÁCH VÃNG LAI";
export const DEFAULT_GUEST = "KHÁCH HÀNG TIẾP THEO";

export type GuestType =
  | typeof SYSTEM_CUSTOMER
  | typeof GUEST
  | typeof DEFAULT_GUEST;
