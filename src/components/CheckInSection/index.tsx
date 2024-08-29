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
} from "@constants/error-message.const";
const UpdateVehicleTypeDialog = lazy(
  () => import("@components/UpdateVehicleTypeDialog")
);
import {
  GET_INFORMATION_SUCCESSFULLY,
  GUEST_CAN_ENTRY,
  PLATE_NOT_READ,
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
      const checkInBody = new FormData();
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

      setCheckInInfo((prev) => ({
        ...prev,
        plateText: plateNumber,
      }));
      checkInBody.append("PlateNumber", cardNumber);

      checkInBody.append("CardNumber", checkInInfo.cardText);
      const plateImageFile = base64StringToFile(
        checkInInfo.plateImgSrc,
        "uploaded_image.png"
      );
      const bodyImageFile = base64StringToFile(
        checkInInfo.plateImgSrc,
        "uploaded_image.png"
      );
      checkInBody.append("ImageIn", plateImageFile);
      checkInBody.append("GateInId", gateId);
      checkInBody.append("ImageBodyIn", bodyImageFile);
      await handleCustomerCheckIn(checkInBody);
    } catch (error) {
      reset();
      console.log(error);
    }
  };

  const handleCheckIn = async (checkInData: CheckIn) => {
    try {
      //rest before update anything
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
      if (plateCamRef.current && bodyCamRef.current) {
        const plateNumberBody = new FormData();
        const plateImageSrc = (plateCamRef.current as any).getScreenshot();
        const bodyImageSrc = (bodyCamRef.current as any).getScreenshot();
        setCheckInInfo((prev) => ({
          ...prev,
          plateImgSrc: plateImageSrc,
          ImageBodySrc: bodyImageSrc,
        }));
        const plateFile = base64StringToFile(
          plateImageSrc,
          "uploaded_image.png"
        );
        const bodyFile = base64StringToFile(bodyImageSrc, "uploaded_image.png");

        plateNumberBody.append("upload", plateFile);
        plateNumberBody.append("regions", "vn");
        await plateDetectionMutation.mutateAsync(plateNumberBody, {
          onSuccess: async (
            plateDetectionRes: SuccessResponse<LicenseResponse>
          ) => {
            const hasResult = plateDetectionRes.data.results[0];
            const current = new Date();
            let plateRead = "";
            if (!hasResult) {
              setCheckInInfo((prev) => ({
                ...prev,
                message: PLATE_NOT_READ,
                isError: true,
                plateImg: plateImageSrc,
                time: current,
              }));
            } else {
              plateRead = plateDetectionRes.data.results[0].plate.toUpperCase();
            }
            checkInData.ImageIn = plateImageSrc;
            const checkInBody = new FormData();
            checkInBody.append("PlateNumber", plateRead);
            setCheckInInfo((prev) => ({
              ...prev,
              cardText: checkInData.CardId,
            }));
            checkInBody.append("CardNumber", checkInData.CardId);
            checkInBody.append("ImageIn", plateFile);
            checkInBody.append("ImageBodyIn", bodyFile);
            checkInBody.append("GateInId", gateId);

            setValue("PlateNumber", checkInData.PlateNumber);
            setCheckInInfo((prev) => ({
              ...prev,
              plateText: plateRead,
              plateImg: plateImageSrc,
              time: current,
            }));
            await handleCustomerCheckIn(checkInBody);
          },
        });
      }
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        if (err.response.status === HttpStatusCode.TooManyRequests) {
          console.log("hi");
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
          }

          if (error.response.data.message === CARD_INACTIVE) {
            setCheckInInfo((prev) => ({
              ...prev,
              message: "THẺ KHÔNG TỒN TẠI TRONG HỆ THỐNG",
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
