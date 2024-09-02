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
  PLATE_NOT_READ,
  PLATE_NOT_VALID,
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
import { HotkeysProvider, useHotkeys } from "react-hotkeys-hook";
import PAGE from "../../../url";
import ParkingContainer from "@components/ParkingContainer";
import { AxiosError, HttpStatusCode } from "axios";
import {
  ELECTRIC_PLATE_NUMBER_REGEX,
  MOTORBIKE_PLATE_NUMBER_REGEX,
} from "@constants/regex";
import {
  CheckInBodyData,
  initCheckInBody,
  setCustomerCheckInData,
  setGuestCheckInFormData,
} from "@utils/set-form-data";
import cropImageToBase64 from "@utils/image";
import { isValidPlateNumber } from "@utils/plate-number";

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
  const [shouldGetCheckInInfo, setShouldGetCheckInInfo] = useState(false);
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
  } = useQuery({
    queryKey: ["/get-info-check-in", checkInInfo.plateText],
    queryFn: () => getCustomerTypeCheckInAPI(checkInInfo.plateText),
    enabled: checkInInfo.plateText !== "",
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
          handleReset();
        },
      });
    } catch (error) {
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

      if (!isElectricPlate && !isMotorbikePlate) {
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

      const checkInBody = setCustomerCheckInData({
        bodyInSrc: checkInInfo.plateImgSrc,
        plateText: plateNumber,
        cardText: cardNumber,
        gateId,
        imageInSrc: checkInInfo.plateImgSrc,
      });

      await handleCustomerCheckIn(checkInBody);
    } catch (error) {
      reset();
      console.log(error);
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

  useEffect(() => {
    const customerTypeData = checkInInfoData?.data.data;

    if (!customerTypeData) return;

    const { customerType } = customerTypeData;
    switch (customerType) {
      case PAID_CUSTOMER || FREE_CUSTOMER: {
        setCheckInInfo((prev) => ({ ...prev, customerType: SYSTEM_CUSTOMER }));
        break;
      }
      case GUEST_CUSTOMER:
        setIsGuest(true);
        setOpenVehicleTypes(true);
        setCheckInInfo((prev) => ({
          ...prev,
          customerType: GUEST,
          message: "Chọn loại xe",
          isError: true,
        }));
        break;
      default:
        setIsGuest(true);
        setOpenVehicleTypes(true);
        setCheckInInfo((prev) => ({
          ...prev,
          customerType: GUEST,
          message: "Chọn loại xe",
          isError: true,
        }));
        break;
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
      if (isGuest) {
        const checkInBody = setGuestCheckInFormData({
          bodyInSrc: finalCustomerCheckInBody.bodyInSrc,
          cardText: finalCustomerCheckInBody.cardText,
          gateId,
          imageInSrc: finalCustomerCheckInBody.imageInSrc,
          plateText: finalCustomerCheckInBody.plateText,
          vehicleType: finalCustomerCheckInBody.vehicleType,
        });
        await handleGuestCheckIn(checkInBody);
        return;
      }

      //* set up data for checkin
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
      console.log(error);
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
        },
        onError: (error: any) => {
          if (error.response.data.message === PLATE_NUMBER_NOT_MATCHED) {
            setCheckInInfo((prev) => ({
              ...prev,
              message: WRONG_NON_PAID_CUSTOMER,
              isError: true,
            }));
            handleReset();
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
