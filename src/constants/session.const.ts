export const CLOSED_SESSION_STATUS = "CLOSED";
export const PARKED_SESSION_STATUS = "PARKED";

export type SessionStatus =
  | typeof CLOSED_SESSION_STATUS
  | typeof PARKED_SESSION_STATUS;
