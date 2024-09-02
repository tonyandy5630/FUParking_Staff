import { base64StringToFile } from "./file";
export const initCheckInBody: CheckInBodyData = {
  gateId: "",
  plateText: "",
  cardText: "",
  imageInSrc: "",
  vehicleType: "",
  bodyInSrc: "",
};

export type CheckInBodyData = {
  gateId: string;
  plateText: string;
  cardText: string;
  imageInSrc: any;
  vehicleType?: string;
  bodyInSrc: string;
};
export const setGuestCheckInFormData = (data: CheckInBodyData) => {
  const { imageInSrc, bodyInSrc, cardText, plateText, gateId, vehicleType } =
    data;
  const plateFile = base64StringToFile(imageInSrc, "upload.png");
  const bodyFile = base64StringToFile(bodyInSrc, "upload.png");

  const newCheckInData = new FormData();
  newCheckInData.append("GateInId", gateId);
  newCheckInData.append("PlateNumber", plateText);
  newCheckInData.append("CardNumber", cardText);
  newCheckInData.append("ImageIn", plateFile);
  newCheckInData.append("ImageBody", bodyFile);
  newCheckInData.append("VehicleTypeId", vehicleType ?? "");

  return newCheckInData;
};

export const setCustomerCheckInData = (data: CheckInBodyData) => {
  const { imageInSrc, bodyInSrc, cardText, plateText, gateId } = data;

  const plateFile = base64StringToFile(imageInSrc, "upload.png");
  const bodyFile = base64StringToFile(bodyInSrc, "upload.png");

  const checkInBody = new FormData();
  checkInBody.append("PlateNumber", plateText);
  checkInBody.append("CardNumber", cardText);
  checkInBody.append("ImageIn", plateFile);
  checkInBody.append("GateInId", gateId);
  checkInBody.append("ImageBodyIn", bodyFile);
  return checkInBody;
};
