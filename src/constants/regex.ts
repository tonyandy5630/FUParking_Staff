export const MOTORBIKE_PLATE_NUMBER_REGEX = /^\d{2}[A-Z]{1,2}\d{5,6}$/;
export const ELECTRIC_PLATE_NUMBER_REGEX = /^[0-9]{2}MD[0-9][0-9]{5,}$/;
export const GENERAL_PLATE_NUMBER_REGEX =
  /^(\d{2})([a-zA-Z]\d|M[ĐD][12])\-?(\d{3,6})(?:\.(\d{2}))?$/i;
