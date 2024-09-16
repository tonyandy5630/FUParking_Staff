export const CLOSED_SESSION_STATUS = "CLOSED";
export const PARKED_SESSION_STATUS = "PARKED";
export const ACTIVE_CARD_STATUS = "ACTIVE";
export const MISSING_CARD_STATUS = "MISSING";
export const DEACTIVE_CARD_STATUS = "DEACTIVE";
export const ALL_STATUS = "ALL";

export type SessionStatus =
  | typeof CLOSED_SESSION_STATUS
  | typeof PARKED_SESSION_STATUS
  | typeof MISSING_CARD_STATUS;
