export const CLOSED_SESSION_STATUS = "CLOSED";
export const PARKED_SESSION_STATUS = "PARKED";
export const MISSING_CARD_STATUS = "MISSING";

export type SessionStatus =
  | typeof CLOSED_SESSION_STATUS
  | typeof PARKED_SESSION_STATUS
  | typeof MISSING_CARD_STATUS;
