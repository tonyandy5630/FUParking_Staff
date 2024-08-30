import { CheckInSchemaType } from "./schema/checkinSchema";
export type GuestCheckInBodyData = {
  gateId: string;
  plateText: string;
  cardText: string;
  ImageIn: any;
  vehicleType: string;
  bodyFile: any;
};
export const setGuestCheckInFormData = (data: GuestCheckInBodyData) => {
  const { ImageIn, bodyFile, cardText, plateText, gateId, vehicleType } = data;
  const newCheckInData = new FormData();
  newCheckInData.append("GateInId", gateId);
  newCheckInData.append("PlateNumber", plateText);
  newCheckInData.append("CardNumber", cardText);
  newCheckInData.append("ImageIn", ImageIn);
  newCheckInData.append("ImageBody", bodyFile);
  newCheckInData.append("VehicleTypeId", vehicleType);

  return newCheckInData;
};

export type CustomerCheckInBodyData = {
  gateId: string;
  plateText: string;
  cardText: string;
  ImageIn: any;
  bodyFile: any;
};
export const setCustomerCheckInData = (data: CustomerCheckInBodyData) => {
  const { ImageIn, bodyFile, cardText, plateText, gateId } = data;

  const checkInBody = new FormData();
  checkInBody.append("PlateNumber", plateText);
  checkInBody.append("CardNumber", cardText);
  checkInBody.append("ImageIn", ImageIn);
  checkInBody.append("GateInId", gateId);
  checkInBody.append("ImageBodyIn", bodyFile);

  return checkInBody;
};
