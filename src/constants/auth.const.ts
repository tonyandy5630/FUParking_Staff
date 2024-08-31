export const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
export const PHONE_REGEX = /^(?:\+?\d{10,15}|\d{10})$/;

export const LENGTH_WARNING = (min: number, max: number) =>
  `At least ${min} - ${max} characters`;
export const EMPTY_WARNING = "Bắt buộc";
