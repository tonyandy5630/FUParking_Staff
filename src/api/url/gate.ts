import baseAPI_URL from ".";

export const GET_ALL_GATE_TYPES_API_URL = `${baseAPI_URL}/gates/types`;

export const GET_ALL_GATE_API_URL = (parkingName?: string) =>
  `${baseAPI_URL}/gates?Attribute=PARKINGAREANAME&SearchInput=${
    parkingName ?? ""
  }`;

export const GET_GATES_BY_PARKING_ID_API_URL = (parkingId: string) =>
  `${baseAPI_URL}/gates/area/${parkingId}`;
