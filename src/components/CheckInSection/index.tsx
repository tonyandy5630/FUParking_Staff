import { SizeTypes } from "@my_types/my-camera";
import { memo, useRef, useState, lazy, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { licensePlateAPI } from "@apis/license.api";
import { base64StringToFile } from "@utils/file";
import {
  CustomerCheckInAPI,
  getCustomerTypeCheckInAPI,
  GuestCheckInAPI,
} from "@apis/check-in.api";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import CheckInSchema from "@utils/schema/checkinSchema";
import { CheckIn, UpdateVehicleTypeInfo } from "@my_types/check-in";
import {
  CARD_INACTIVE,
  CARD_IS_MISSING_ERROR,
  CARD_NOT_EXISTED_ERROR,
  PLATE_NUMBER_NOT_MATCHED,
  VEHICLE_IN_PARKING_ERROR,
} from "@constants/error-message.const";
const UpdateVehicleTypeDialog = lazy(
  () => import("@components/UpdateVehicleTypeDialog")
);
import {
  CARD_HAS_PREVIOUS_SESSION,
  CARD_MISSING,
  CARD_NOT_ACTIVE,
  CARD_NOT_IN_SYSTEM,
  GUEST_CAN_ENTRY,
  PLATE_NOT_READ,
  PLATE_NOT_VALID,
  SELECT_VEHICLE_TYPE,
  VEHICLE_IS_PARKING,
  VERIFYING,
  WRONG_NON_PAID_CUSTOMER,
} from "@constants/message.const";
import {
  GUEST_CUSTOMER,
  GUEST,
  GuestTypeMessage,
  NEXT_CUSTOMER,
  PAID_CUSTOMER,
  SYSTEM_CUSTOMER,
  FREE_CUSTOMER,
} from "@constants/customer.const";
import useSelectGate from "../../hooks/useSelectGate";
import { GATE_IN } from "@constants/gate.const";
import CameraSection from "@components/CameraSection";
import CheckInVehicleForm from "./CheckInVehicleForm";
import { HotkeysProvider } from "react-hotkeys-hook";
import PAGE from "../../../url";
import ParkingContainer from "@components/ParkingContainer";
import { AxiosError, HttpStatusCode } from "axios";
import {
  CheckInBodyData,
  initCheckInBody,
  setCustomerCheckInData,
  setGuestCheckInFormData,
} from "@utils/set-form-data";
import cropImageToBase64 from "@utils/image";
import { isValidPlateNumber, unFormatPlateNumber } from "@utils/plate-number";
import { ErrorResponseAPI } from "@my_types/index";
import { PENDING_VEHICLE } from "@constants/vehicle.const";

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
  customerType: GuestTypeMessage | "";
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
  message: "",
  isError: false,
  vehicleType: "",
  croppedPlateImage: "",
};

function CheckInSection({ cameraSize = "sm", ...props }: Props) {
  const plateCamRef = useRef(null);
  const bodyCamRef = useRef(null);
  const { gateId } = useSelectGate(GATE_IN, true);
  const [isGuest, setIsGuest] = useState(false);
  const [checkInInfo, setCheckInInfo] = useState<CheckInInfo>(initCheckInInfo);
  const [openVehicleTypes, setOpenVehicleTypes] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [updateVehicleInfo, setUpdateVehicleInfo] = useState<
    UpdateVehicleTypeInfo | undefined
  >(undefined);
  const [finalCustomerCheckInBody, setFinalCustomerCheckInBody] =
    useState<CheckInBodyData>(initCheckInBody);

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
    getValues,
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
    data: checkInInfoData,
    isLoading: isGettingInfoData,
    isError: isErrorGettingInfoData,
    error,
  } = useQuery({
    queryKey: [
      "/get-info-check-in",
      checkInInfo.plateText,
      watch("CardId").trim(),
    ],
    queryFn: () =>
      getCustomerTypeCheckInAPI(checkInInfo.plateText, watch("CardId").trim()),
    enabled:
      checkInInfo.plateText.trim() !== "" && watch("CardId").trim() !== "",
    retry: 0,
    gcTime: 0,
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
    setIsGuest(false);
    setFocus("CardId");
    reset();
  };

  const handleResetCardText = () => {
    setFocus("CardId");
    reset({ CardId: "" });
  };

  //* error api effect
  useEffect(() => {
    if (isErrorGettingInfoData) {
      const err = error as AxiosError<ErrorResponseAPI>;
      const errRes = err.response;
      if (!errRes) {
        setCheckInInfo((prev) => ({
          ...prev,
          message: "Lỗi hệ thống",
          isError: true,
        }));
        return;
      }

      const message = errRes.data.message;
      if (message === VEHICLE_IN_PARKING_ERROR) {
        setCheckInInfo((prev) => ({
          ...prev,
          message: VEHICLE_IS_PARKING,
          isError: true,
        }));
        handleResetCardText();

        return;
      }

      if (message === CARD_IS_MISSING_ERROR) {
        setCheckInInfo((prev) => ({
          ...initCheckInInfo,
          message: CARD_MISSING,
          isError: true,
        }));
        handleResetCardText();
        return;
      }

      if (message === CARD_NOT_EXISTED_ERROR) {
        setCheckInInfo((prev) => ({
          ...initCheckInInfo,
          message: CARD_NOT_IN_SYSTEM,
          isError: true,
        }));
        handleResetCardText();
        return;
      }

      return;
    }
  }, [isErrorGettingInfoData]);

  const handleGuestCheckIn = async (checkInBody: any) => {
    try {
      await guestCheckInMutation.mutateAsync(checkInBody as any, {
        onSuccess: () => {
          setIsGuest(false);
          handleReset();
          setCheckInInfo((prev) => ({
            ...prev,
            message: "KHÁCH CÓ THỂ VÀO",
            isError: false,
          }));
        },
      });
    } catch (err: unknown) {
      const error = err as AxiosError<ErrorResponseAPI>;
      if (!error?.response?.data || !error?.response) {
        setCheckInInfo((prev) => ({
          ...prev,
          message: "Lỗi hệ thống",
          isError: true,
        }));
        return;
      }

      if (error.response.status === HttpStatusCode.NotFound) {
        setCheckInInfo((prev) => ({
          ...prev,
          message: CARD_NOT_IN_SYSTEM,
          isError: true,
        }));
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
      setCheckInInfo((prev) => ({ ...prev, message: "Lỗi hệ thống" }));
    }
  };

  const handleVehicleTypeChange = (vehicleType: string) => {
    try {
      setCheckInInfo((prev) => ({ ...prev, vehicleType }));
      setFinalCustomerCheckInBody((prev) => ({
        ...prev,
        vehicleType,
      }));
    } catch (error) {
      handleReset();
      setCheckInInfo((prev) => ({ ...prev, message: "Lỗi hệ thống" }));
    }
  };

  const handleFixPlate = () => {
    try {
      const plateNumber = unFormatPlateNumber(
        watch("PlateNumber")?.toUpperCase() as string
      );
      const cardNumber = getValues("CardId");
      if (cardNumber === "") {
        handleReset();
        setCheckInInfo((prev) => ({
          ...initCheckInInfo,
          cardText: cardNumber,
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
      const isValidPlate = isValidPlateNumber(plateNumber);

      if (!isValidPlate) {
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

      setFinalCustomerCheckInBody((prev) => ({
        ...prev,
        plateText: plateNumber,
      }));
    } catch (error) {
      handleReset();
      setCheckInInfo({
        ...initCheckInInfo,
        message: "Lỗi hệ thống",
        isError: true,
      });
    }
  };

  /**
   * Handle detection and loading data for checking in
   * @returns
   */
  const handlePlateDetection = async (checkInData: CheckIn) => {
    let plateRead = "";
    const checkInDate = new Date();
    let croppedImage = "";
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

      //* detect plate
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
          } else {
            plateRead = plateDetectionRes.data.results[0].plate.toUpperCase();
          }

          //* crop plate image
          const cropCordinates = result.box;
          croppedImage = await cropImageToBase64(plateImageSrc, cropCordinates);
        },
      });

      //* set data for checkin
      setFinalCustomerCheckInBody((prev) => ({
        ...prev,
        imageInSrc: plateImageSrc,
        cardText: checkInData.CardId,
        gateId,
        bodyInSrc: bodyImageSrc,
        plateText: plateRead,
      }));

      //* plate validation
      const isValidPlate = isValidPlateNumber(plateRead);
      if (!isValidPlate) {
        setCheckInInfo((prev) => ({
          ...prev,
          message: PLATE_NOT_VALID,
          isError: true,
          plateText: plateRead,
          croppedPlateImage: croppedImage,
          time: checkInDate,
        }));
        return plateRead;
      }

      setCheckInInfo((prev) => ({
        ...prev,
        plateImgSrc: plateImageSrc,
        ImageBodySrc: bodyImageSrc,
        message: GUEST_CAN_ENTRY,
        croppedPlateImage: croppedImage,
        plateText: plateRead,
        time: checkInDate,
        isError: false,
      }));

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

  //* effect get info
  useEffect(() => {
    const customerTypeData = checkInInfoData?.data.data;
    if (!customerTypeData) return;

    const { customerType, previousSessionInfo, informationVehicle } =
      customerTypeData;

    if (
      informationVehicle !== null &&
      informationVehicle.statusVehicle === PENDING_VEHICLE
    ) {
      setUpdateVehicleInfo(informationVehicle);
      handleOpenDialogChange();
      return;
    }

    if (previousSessionInfo !== null && previousSessionInfo) {
      const { cardOrPlateNumber } = previousSessionInfo;
      if (cardOrPlateNumber === "CARD") {
        setCheckInInfo({
          ...initCheckInInfo,
          message: CARD_HAS_PREVIOUS_SESSION,
          isError: true,
        });
      } else {
        setCheckInInfo({
          ...initCheckInInfo,
          message: VEHICLE_IS_PARKING,
          isError: true,
        });
      }
      handleResetCardText();
      return;
    }

    if (customerType !== null) {
      switch (customerType) {
        case FREE_CUSTOMER: {
          setIsGuest(false);
          setCheckInInfo((prev) => ({
            ...prev,
            customerType: SYSTEM_CUSTOMER,
            message: GUEST_CAN_ENTRY,
            isError: false,
          }));
          break;
        }
        case PAID_CUSTOMER: {
          setIsGuest(false);
          setCheckInInfo((prev) => ({
            ...prev,
            customerType: SYSTEM_CUSTOMER,
            message: GUEST_CAN_ENTRY,
            isError: false,
          }));
          break;
        }
        case GUEST_CUSTOMER:
          setIsGuest(true);
          setOpenVehicleTypes(true);
          setCheckInInfo((prev) => ({
            ...prev,
            customerType: GUEST,
            message: SELECT_VEHICLE_TYPE,
            isError: true,
          }));
          break;
        default:
          setIsGuest(true);
          setOpenVehicleTypes(true);
          setCheckInInfo((prev) => ({
            ...prev,
            customerType: GUEST,
            message: SELECT_VEHICLE_TYPE,
            isError: true,
          }));
          break;
      }
    }
  }, [checkInInfoData?.data.data]);

  const handleCheckIn = useCallback(async () => {
    try {
      if (!finalCustomerCheckInBody) {
        setCheckInInfo((prev) => ({
          ...initCheckInInfo,
          message: "Lỗi dữ liệu gửi đi",
          isError: true,
        }));
        return;
      }

      if (!plateCamRef || !bodyCamRef) {
        setCheckInInfo((prev) => ({
          ...prev,
          message: "Không tìm thấy camera",
          isError: true,
        }));
        return;
      }

      //reset before update anything
      // setCheckInInfo((prev) => initCheckInInfo);
      if (checkInInfo.cardText.trim().length > 10) {
        setCheckInInfo(() => ({
          ...initCheckInInfo,
          message: "Thao tác chậm lại",
          isError: true,
        }));
        handleReset();
        return;
      }

      //* check in for guest
      if (isGuest) {
        const checkInBody = setGuestCheckInFormData({
          bodyInSrc: finalCustomerCheckInBody.bodyInSrc,
          cardText: finalCustomerCheckInBody.cardText,
          gateId,
          imageInSrc: finalCustomerCheckInBody.imageInSrc,
          plateText: finalCustomerCheckInBody.plateText,
          vehicleType: finalCustomerCheckInBody.vehicleType,
        });

        if (
          !finalCustomerCheckInBody.vehicleType ||
          finalCustomerCheckInBody.vehicleType === ""
        ) {
          setCheckInInfo((prev) => ({
            ...prev,
            message: SELECT_VEHICLE_TYPE,
            isError: true,
          }));
          return;
        }
        await handleGuestCheckIn(checkInBody);
        return;
      }

      //* check in for customer / free customer

      const checkInBody = setCustomerCheckInData({
        bodyInSrc: finalCustomerCheckInBody.bodyInSrc,
        cardText: finalCustomerCheckInBody.cardText,
        gateId,
        imageInSrc: finalCustomerCheckInBody.imageInSrc,
        plateText: finalCustomerCheckInBody.plateText,
      });

      setCheckInInfo((prev) => ({
        ...prev,
        cardText: finalCustomerCheckInBody.cardText,
      }));
      setValue("PlateNumber", finalCustomerCheckInBody.plateText);
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
  }, [finalCustomerCheckInBody, isGuest]);

  const handleCustomerCheckIn = async (body: any) => {
    try {
      await customerCheckInMutation.mutateAsync(body as any, {
        onSuccess: (res) => {
          handleReset();
          setCheckInInfo((prev) => ({
            ...prev,
            message: NEXT_CUSTOMER,
            isError: false,
          }));
        },
        onError: (err: any) => {
          const error = err as AxiosError<ErrorResponseAPI>;
          if (!error?.response?.data || !error?.response) {
            setCheckInInfo((prev) => ({
              ...prev,
              message: "Lỗi hệ thống",
              isError: true,
            }));
            return;
          }

          if (error.response.data.message === CARD_NOT_EXISTED_ERROR) {
            setCheckInInfo((prev) => ({
              ...prev,
              message: CARD_NOT_IN_SYSTEM,
              isError: true,
            }));
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
        <HotkeysProvider initiallyActiveScopes={[PAGE.VERIFY_VEHICLE]}>
          <UpdateVehicleTypeDialog
            open={true}
            info={updateVehicleInfo}
            onOpenChange={handleOpenDialogChange}
          />
        </HotkeysProvider>
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
          onGetCheckInInfo={handlePlateDetection}
          onVehicleTypeChange={handleVehicleTypeChange}
          checkInInfo={checkInInfo}
          onFixPlate={handleFixPlate}
          onCheckIn={handleCheckIn}
          onReset={handleReset}
        />
      </HotkeysProvider>
    </ParkingContainer>
  );
}

export default memo(CheckInSection);
