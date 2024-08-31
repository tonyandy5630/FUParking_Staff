import { SizeTypes } from "@my_types/my-camera";
import { memo, useRef, useState, lazy } from "react";
import { useMutation } from "@tanstack/react-query";
import { licensePlateAPI } from "@apis/license.api";
import { SuccessResponse } from "@my_types/index";
import { LicenseResponse } from "@my_types/license";
import { base64StringToFile } from "@utils/file";
import { CustomerCheckInAPI, GuestCheckInAPI } from "@apis/check-in.api";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import CheckInSchema, { CheckInSchemaType } from "@utils/schema/checkinSchema";
import { CheckIn, UpdateVehicleTypeInfo } from "@my_types/check-in";
import {
  CARD_INACTIVE,
  CUSTOMER_NOT_EXIST_ERROR,
  PLATE_NUMBER_NOT_MATCHED,
} from "@constants/error-message.const";
const UpdateVehicleTypeDialog = lazy(
  () => import("@components/UpdateVehicleTypeDialog")
);
import {
  CARD_NOT_ACTIVE,
  GET_INFORMATION_SUCCESSFULLY,
  GUEST_CAN_ENTRY,
  PLATE_NOT_MATCH,
  PLATE_NOT_READ,
  PLATE_NOT_VALID,
  WRONG_NON_PAID_CUSTOMER,
} from "@constants/message.const";
import {
  GUEST,
  GuestType,
  NEXT_CUSTOMER,
  SYSTEM_CUSTOMER,
} from "@constants/customer.const";
import useSelectGate from "../../hooks/useSelectGate";
import { GATE_IN } from "@constants/gate.const";
import CameraSection from "@components/CameraSection";
import CheckInVehicleForm from "./CheckInVehicleForm";
import { SUBMIT_LEFT_HOTKEY } from "../../hotkeys/key";
import { HotkeysProvider, useHotkeys } from "react-hotkeys-hook";
import PAGE from "../../../url";
import ParkingContainer from "@components/ParkingContainer";
import { AxiosError, HttpStatusCode } from "axios";
import {
  ELECTRIC_PLATE_NUMBER_REGEX,
  MOTORBIKE_PLATE_NUMBER_REGEX,
} from "@constants/regex";
import {
  setCustomerCheckInData,
  setGuestCheckInFormData,
} from "@utils/set-form-data";
import cropImageToBase64 from "@utils/image";

export type Props = {
  plateDeviceId: ConstrainDOMString | undefined;
  bodyDeviceId: ConstrainDOMString | undefined;
  cameraSize?: SizeTypes;
  children: any;
};

export type CheckInInfo = {
  plateText: string;
  cardText: string;
  plateImgSrc: string;
  ImageBodySrc: string;
  time?: Date;
  customerType: GuestType | "";
  message: string;
  isError: boolean;
  vehicleType: string;
  croppedPlateImage?: string;
};

const initCheckInInfo: CheckInInfo = {
  plateText: "",
  cardText: "",
  plateImgSrc: "",
  ImageBodySrc: "",
  time: undefined,
  customerType: "",
  message: NEXT_CUSTOMER,
  isError: false,
  vehicleType: "",
  croppedPlateImage: "",
};

function CheckInSection({ cameraSize = "sm", ...props }: Props) {
  const plateCamRef = useRef(null);
  const bodyCamRef = useRef(null);
  const { gateId } = useSelectGate(GATE_IN);
  const [isGuest, setIsGuest] = useState(false);
  const [checkInInfo, setCheckInInfo] = useState<CheckInInfo>(initCheckInInfo);
  const [openVehicleTypes, setOpenVehicleTypes] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [updateVehicleInfo, setUpdateVehicleInfo] = useState<
    UpdateVehicleTypeInfo | undefined
  >(undefined);

  const methods = useForm({
    resolver: yupResolver(CheckInSchema),
    defaultValues: {
      GateInId: gateId,
      CardId: "",
      PlateNumber: "",
    },
  });

  const {
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
    setFocus,
  } = methods;

  const plateDetectionMutation = useMutation({
    mutationKey: ["plate-detection"],
    mutationFn: licensePlateAPI,
  });

  const customerCheckInMutation = useMutation({
    mutationKey: ["customer-check-in"],
    mutationFn: CustomerCheckInAPI,
  });

  const guestCheckInMutation = useMutation({
    mutationKey: ["guest-check-in"],
    mutationFn: GuestCheckInAPI,
  });

  const {
    isSuccess: isCustomerCheckInSuccess,
    isPending: isCustomerCheckingIn,
    isError: isCustomerCheckInError,
  } = customerCheckInMutation;

  const {
    isSuccess: isGuestCheckInSuccess,
    isPending: isGuestCheckingIn,
    isError: isGuestCheckInError,
  } = guestCheckInMutation;

  const handleOpenDialogChange = () => {
    setOpenDialog((prev) => !prev);
  };

  const handleReset = () => {
    setCheckInInfo(initCheckInInfo);
    setFocus("CardId");
    reset();
  };

  const handleGuestCheckIn = async (checkInBody: any) => {
    try {
      await guestCheckInMutation.mutateAsync(checkInBody as any, {
        onSuccess: () => {
          setIsGuest(false);
          setCheckInInfo((prev) => ({
            ...prev,
            message: "KHÁCH CÓ THỂ VÀO",
            isError: false,
          }));
          setFocus("CardId");
          reset();
        },
      });
    } catch (error) {
      reset();
      setCheckInInfo((prev) => ({ ...prev, message: "Lỗi hệ thống" }));
    }
  };

  const handleVehicleTypeChange = async (vehicleType: string) => {
    try {
      setCheckInInfo((prev) => ({ ...prev, vehicleType }));

      const {
        plateImgSrc: imageFile,
        cardText,
        plateText,
        ImageBodySrc,
        time,
      } = checkInInfo;
      if (!MOTORBIKE_PLATE_NUMBER_REGEX.test(plateText)) {
        setCheckInInfo((prev) => ({
          ...prev,
          message: PLATE_NOT_VALID,
          plateText: plateText,
          isError: true,
        }));
        return;
      }
      const checkInBody = new FormData();
      const file = base64StringToFile(imageFile, "uploaded_image.png");
      const bodyFile = base64StringToFile(ImageBodySrc, "uploaded_image.png");
      checkInBody.append("GateInId", gateId);
      checkInBody.append("PlateNumber", plateText);
      checkInBody.append("CardNumber", checkInInfo.cardText);
      checkInBody.append("ImageIn", file);
      checkInBody.append("VehicleTypeId", vehicleType);
      checkInBody.append("ImageBody", bodyFile);
      await handleGuestCheckIn(checkInBody);
    } catch (error) {
      console.log(error);
      reset();
      setCheckInInfo((prev) => ({ ...prev, message: "Lỗi hệ thống" }));
    }
  };

  const handleFixPlate = async () => {
    try {
      const plateNumber = watch("PlateNumber")?.toUpperCase() as string;
      const cardNumber = checkInInfo.cardText;

      if (cardNumber === "") {
        setCheckInInfo((prev) => ({
          ...initCheckInInfo,
          message: "Chưa quẹt thẻ",
          isError: true,
        }));
        return;
      }

      if (plateNumber === "") {
        setCheckInInfo((prev) => ({
          ...initCheckInInfo,
          message: "Chưa nhập biển số",
          isError: true,
        }));
        return;
      }
      const isElectricPlate = ELECTRIC_PLATE_NUMBER_REGEX.test(plateNumber);
      const isMotorbikePlate = MOTORBIKE_PLATE_NUMBER_REGEX.test(plateNumber);

      if (!isElectricPlate || !isMotorbikePlate) {
        setCheckInInfo((prev) => ({
          ...prev,
          message: PLATE_NOT_VALID,
          plateText: plateNumber,
          isError: true,
        }));
        return;
      }

      setCheckInInfo((prev) => ({
        ...prev,
        plateText: plateNumber,
      }));
      const plateImageFile = base64StringToFile(
        checkInInfo.plateImgSrc,
        "uploaded_image.png"
      );
      const bodyImageFile = base64StringToFile(
        checkInInfo.plateImgSrc,
        "uploaded_image.png"
      );
      const checkInBody = setCustomerCheckInData({
        bodyFile: bodyImageFile,
        plateText: plateNumber,
        cardText: cardNumber,
        gateId,
        ImageIn: plateImageFile,
      });

      await handleCustomerCheckIn(checkInBody);
    } catch (error) {
      reset();
      console.log(error);
    }
  };

  const handlePlateDetection = async () => {
    let plateRead = "";
    try {
      const plateNumberBody = new FormData();
      //* take vehicle picture
      const plateImageSrc = (plateCamRef.current as any).getScreenshot();
      const bodyImageSrc = (bodyCamRef.current as any).getScreenshot();

      //* save data for checkin
      setCheckInInfo((prev) => ({
        ...prev,
        plateImgSrc: plateImageSrc,
        ImageBodySrc: bodyImageSrc,
      }));
      const plateFile = base64StringToFile(plateImageSrc, "uploaded_image.png");

      plateNumberBody.append("upload", plateFile);
      plateNumberBody.append("regions", "vn");

      await plateDetectionMutation.mutateAsync(plateNumberBody, {
        onSuccess: async (plateDetectionRes) => {
          const result = plateDetectionRes.data.results[0];
          if (!result) {
            setCheckInInfo((prev) => ({
              ...prev,
              message: PLATE_NOT_READ,
              isError: true,
              plateImg: plateImageSrc,
            }));
            return;
          } else {
            plateRead = plateDetectionRes.data.results[0].plate.toUpperCase();
          }
          const cropCordinates = result.box;
          const croppedImage = await cropImageToBase64(
            plateImageSrc,
            cropCordinates
          );
          setCheckInInfo((prev) => ({
            ...prev,
            plateText: plateRead,
            croppedPlateImage: croppedImage,
          }));
        },
      });
      return plateRead;
    } catch (error) {
      setCheckInInfo((prev) => ({
        ...prev,
        message: "Lỗi khi đọc biển số",
        plateText: plateRead,
        isError: true,
      }));
      return plateRead;
    }
  };

  const handleCheckIn = async (checkInData: CheckIn) => {
    try {
      if (!plateCamRef || !bodyCamRef) {
        setCheckInInfo((prev) => ({
          ...prev,
          message: "Không tìm thấy camera",
          isError: true,
        }));
        return;
      }
      const current = new Date();
      //reset before update anything
      setCheckInInfo((prev) => initCheckInInfo);
      if (checkInInfo.cardText.length > 10) {
        setCheckInInfo(() => ({
          ...initCheckInInfo,
          message: "Thao tác chậm lại",
          isError: true,
        }));
        handleReset();
        return;
      }
      const plateRead = await handlePlateDetection();

      //* set up data for checkin
      const plateImageSrc = (plateCamRef.current as any).getScreenshot();
      const bodyImageSrc = (bodyCamRef.current as any).getScreenshot();
      setCheckInInfo((prev) => ({
        ...prev,
        plateImgSrc: plateImageSrc,
        ImageBodySrc: bodyImageSrc,
      }));
      const plateFile = base64StringToFile(plateImageSrc, "uploaded_image.png");
      const bodyFile = base64StringToFile(bodyImageSrc, "uploaded_image.png");

      let isElectric = false;
      if (plateRead === "") {
        setCheckInInfo((prev) => ({
          ...prev,
          message: PLATE_NOT_READ,
          plateText: plateRead,
          time: current,
          isError: true,
        }));
      } else {
        isElectric = ELECTRIC_PLATE_NUMBER_REGEX.test(plateRead);
        const isMotorbike = MOTORBIKE_PLATE_NUMBER_REGEX.test(plateRead);
        //* test if the palte number match motorbike plate or electric plate
        if (!isElectric || !isMotorbike) {
          setCheckInInfo((prev) => ({
            ...prev,
            message: PLATE_NOT_VALID,
            plateText: plateRead,
            time: current,
            isError: true,
          }));
        }
      }
      const checkInBody = setCustomerCheckInData({
        bodyFile,
        cardText: checkInData.CardId,
        gateId,
        ImageIn: plateFile,
        plateText: plateRead,
      });
      setCheckInInfo((prev) => ({
        ...prev,
        cardText: checkInData.CardId,
      }));
      setValue("PlateNumber", checkInData.PlateNumber);
      setCheckInInfo((prev) => ({
        ...prev,
        plateText: plateRead,
        plateImg: plateImageSrc,
        time: current,
      }));

      await handleCustomerCheckIn(checkInBody);
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        if (err.response.status === HttpStatusCode.TooManyRequests) {
          setCheckInInfo((prev) => ({
            ...prev,
            message: "Hãy thao tác chậm lại",
            isError: true,
          }));
          reset();
          return;
        }
      }

      setCheckInInfo((prev) => ({
        ...prev,
        message: "Lỗi hệ thống",
        isError: true,
      }));
    }
  };

  const handleCustomerCheckIn = async (body: any) => {
    try {
      await customerCheckInMutation.mutateAsync(body as any, {
        onSuccess: (res) => {
          if (res.data.message === GET_INFORMATION_SUCCESSFULLY) {
            reset();
            if (res.data.data) {
              setUpdateVehicleInfo(res.data.data);
              setOpenDialog(true);
            }
          }

          setCheckInInfo((prev) => ({
            ...prev,
            plateImg: checkInInfo.plateImgSrc,
            customerType: SYSTEM_CUSTOMER,
            message: GUEST_CAN_ENTRY,
          }));
          reset();
          setFocus("CardId");
        },
        onError: (error: any) => {
          if (error.response.data.message === CUSTOMER_NOT_EXIST_ERROR) {
            setIsGuest(true);
            setOpenVehicleTypes(true);
            setCheckInInfo((prev) => ({
              ...prev,
              message: "Chọn loại xe",
              isError: true,
            }));

            setCheckInInfo((prev) => ({
              ...prev,
              customerType: GUEST,
            }));
            return;
          }

          if ((error.response.data as any).PlateNumber[0] === PLATE_NOT_READ) {
            setCheckInInfo((prev) => ({
              ...prev,
              message: "Không có biển số xe",
              isError: true,
            }));
            reset();
            return;
          }

          if (error.response.data.message === PLATE_NUMBER_NOT_MATCHED) {
            setCheckInInfo((prev) => ({
              ...prev,
              message: WRONG_NON_PAID_CUSTOMER,
              isError: true,
            }));
            return;
          }

          if (error.response.data.message === CARD_INACTIVE) {
            setCheckInInfo((prev) => ({
              ...prev,
              message: CARD_NOT_ACTIVE,
              isError: true,
            }));
          }
        },
      });
    } catch (error) {
      reset();
    }
  };

  return (
    <ParkingContainer>
      {openDialog && (
        <UpdateVehicleTypeDialog
          open={true}
          info={updateVehicleInfo}
          onOpenChange={handleOpenDialogChange}
        />
      )}
      <CameraSection
        imageSrc={checkInInfo.plateImgSrc}
        bodyImageSrc={checkInInfo.ImageBodySrc}
        plateCameRef={plateCamRef}
        bodyCameRef={bodyCamRef}
        isLoading={
          plateDetectionMutation.isPending ||
          isCustomerCheckingIn ||
          isGuestCheckingIn
        }
        plateDeviceId={props.plateDeviceId}
        bodyDeviceId={props.bodyDeviceId}
      />
      <HotkeysProvider initiallyActiveScopes={[PAGE.CHECK_IN]}>
        <CheckInVehicleForm
          methods={methods}
          isLoading={
            plateDetectionMutation.isPending ||
            isCustomerCheckingIn ||
            isGuestCheckingIn
          }
          onCheckIn={handleCheckIn}
          onVehicleTypeChange={handleVehicleTypeChange}
          checkInInfo={checkInInfo}
          onFixPlate={handleFixPlate}
          onReset={handleReset}
        />
      </HotkeysProvider>
    </ParkingContainer>
  );
}

export default memo(CheckInSection);
