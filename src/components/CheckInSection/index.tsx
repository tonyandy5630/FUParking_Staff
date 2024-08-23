import { SizeTypes } from "@my_types/my-camera";
import { memo, useCallback, useRef, useState, lazy } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { licensePlateAPI } from "@apis/license.api";
import { SuccessResponse } from "@my_types/index";
import { LicenseResponse } from "@my_types/license";
import { base64StringToFile } from "@utils/file";
import { CustomerCheckInAPI, GuestCheckInAPI } from "@apis/check-in.api";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import CheckInSchema, { CheckInSchemaType } from "@utils/schema/checkinSchema";
import { CheckIn, UpdateVehicleTypeInfo } from "@my_types/check-in";
import { CUSTOMER_NOT_EXIST_ERROR } from "@constants/error-message.const";
import toLocaleDate from "@utils/date";
const UpdateVehicleTypeDialog = lazy(
  () => import("@components/UpdateVehicleTypeDialog")
);
import { GET_INFORMATION_SUCCESSFULLY } from "@constants/message.const";
import {
  DEFAULT_GUEST,
  GUEST,
  GuestType,
  SYSTEM_CUSTOMER,
} from "@constants/customer.const";
import { GET_GATE_IN_ID_CHANNEL } from "@channels/index";
import useSelectGate from "../../hooks/useSelectGate";
import { GATE_IN } from "@constants/gate.const";
import CameraSection from "@components/CameraSection";
import VehicleForm from "@components/VehicleForm";

export type Props = {
  deviceId: ConstrainDOMString | undefined;
  cameraSize?: SizeTypes;
  children: any;
  currentDevice: ConstrainDOMString | undefined;
  cardRef: React.RefObject<HTMLInputElement>;
};

export type CheckInInfo = {
  plateText: string;
  cardText: string;
  plateImgSrc: string;
  imageBodyInSrc: string;
  time: Date;
  customerType: GuestType;
  message: string;
};

const initCheckInInfo: CheckInInfo = {
  plateText: "",
  cardText: "",
  plateImgSrc: "",
  imageBodyInSrc: "",
  time: new Date(),
  customerType: DEFAULT_GUEST,
  message: "",
};

function CheckInSection({ cameraSize = "sm", cardRef, ...props }: Props) {
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

  const handleChangePlateTxt = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setCheckInInfo((prev) => ({ ...prev, plateText: e.target.value }));
  };

  const focusCardInput = () => {
    if (cardRef.current) cardRef.current?.focus();
  };

  const handleOpenDialogChange = () => {
    setOpenDialog((prev) => !prev);
  };

  const handleVehicleTypeChange = async (e: string) => {
    try {
      const {
        plateImgSrc: imageFile,
        cardText,
        plateText,
        imageBodyInSrc,
        time,
      } = checkInInfo;
      const checkInBody = new FormData();
      const file = base64StringToFile(imageFile, "uploaded_image.png");
      const bodyFile = base64StringToFile(imageBodyInSrc, "uploaded_image.png");
      checkInBody.append("GateInId", gateId);
      checkInBody.append("PlateNumber", plateText);
      checkInBody.append("CardNumber", checkInInfo.cardText);
      checkInBody.append("ImageIn", file);
      checkInBody.append("VehicleTypeId", e);
      checkInBody.append("ImageBody", bodyFile);
      console.log(checkInBody);
      await guestCheckInMutation.mutateAsync(checkInBody as any, {
        onSuccess: (res) => {
          setIsGuest(false);
          setCheckInInfo((prev) => ({
            ...prev,
            message: "KHÁCH CÓ THỂ VÀO",
          }));
          reset();
          setCheckInInfo((prev) => ({
            ...prev,
            plateImg: imageFile,
            time: new Date(),
          }));
        },
      });
    } catch (error) {
      reset();
      setCheckInInfo((prev) => ({ ...prev, message: "Lỗi hệ thống" }));
      focusCardInput();
    }
  };

  const handleSendCheckout = async () => {
    try {
      const checkInBody = new FormData();
      checkInBody.append("PlateNumber", checkInInfo.cardText);
      checkInBody.append(
        "CardNumber",
        (cardRef.current?.value as string) ?? checkInInfo.cardText
      );
      const file = base64StringToFile(
        checkInInfo.plateImgSrc,
        "uploaded_image.png"
      );
      checkInBody.append("ImageIn", file);
      checkInBody.append("GateInId", gateId);

      await customerCheckInMutation.mutateAsync(checkInBody as any, {
        onSuccess: (res) => {
          if (res.data.message === GET_INFORMATION_SUCCESSFULLY) {
            if (res.data.data) {
              setUpdateVehicleInfo(res.data.data);
              setOpenDialog(true);
            }
          }
          setCheckInInfo((prev) => ({ ...prev, message: "KHÁCH CÓ THỂ VÀO" }));
        },
        onError: async (error: any) => {
          if (error.response.data.message === CUSTOMER_NOT_EXIST_ERROR) {
            setIsGuest(true);
            setOpenVehicleTypes(true);
            setCheckInInfo((prev) => ({ ...prev, message: "Chọn loại xe" }));

            setCheckInInfo((prev) => ({
              ...prev,
              customerType: GUEST,
            }));
          }
        },
      });
    } catch (error) {
      reset();
      console.log(error);
    }
  };
  const onCheckIn = async (checkInData: CheckIn) => {
    try {
      setCheckInInfo((prev) => initCheckInInfo);
      if (plateCamRef.current && bodyCamRef.current) {
        const plateNumberBody = new FormData();
        const plateImageSrc = (plateCamRef.current as any).getScreenshot();
        const bodyImageSrc = (bodyCamRef.current as any).getScreenshot();
        setCheckInInfo((prev) => ({ ...prev, plateImgSrc: plateImageSrc }));
        setCheckInInfo((prev) => ({ ...prev, imageBodyInSrc: bodyImageSrc }));
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
            if (!plateDetectionRes.data.results[0]) {
              reset();
              setCheckInInfo((prev) => ({
                ...prev,
                message: "Không đọc được biển số xe. Hãy thử lại",
              }));
            }
            checkInData.PlateNumber =
              plateDetectionRes.data.results[0].plate.toUpperCase();
            checkInData.ImageIn = plateImageSrc;
            const checkInBody = new FormData();
            checkInBody.append(
              "PlateNumber",
              plateDetectionRes.data.results[0].plate.toUpperCase()
            );
            setCheckInInfo((prev) => ({
              ...prev,
              cardText: checkInData.CardId,
            }));
            checkInBody.append("CardNumber", checkInData.CardId);
            checkInBody.append("ImageIn", plateFile);
            checkInBody.append("ImageBodyIn", bodyFile);
            const gateInID = await window.ipcRenderer.invoke(
              GET_GATE_IN_ID_CHANNEL
            );
            checkInBody.append("GateInId", gateInID);

            setValue("PlateNumber", checkInData.PlateNumber);
            setCheckInInfo((prev) => ({
              ...prev,
              plateText: plateDetectionRes.data.results[0].plate.toUpperCase(),
              plateImg: plateImageSrc,
            }));
            await handleCustomerCheckIn(checkInBody);
          },
        });
      }
    } catch (error) {
      setCheckInInfo((prev) => ({
        ...prev,
        message: "Không đọc được biển số xe. Hãy thử lại",
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
            message: "KHÁCH CÓ THỂ VÀO",
          }));

          setCheckInInfo((prev) => ({
            ...prev,
            plateImg: checkInInfo.plateImgSrc,
            customerType: SYSTEM_CUSTOMER,
            time: new Date(),
          }));
        },
        onError: (error: any) => {
          if (error.response.data.message === CUSTOMER_NOT_EXIST_ERROR) {
            setIsGuest(true);
            setOpenVehicleTypes(true);
            setCheckInInfo((prev) => ({
              ...prev,
              message: "Chọn loại xe",
            }));

            setCheckInInfo((prev) => ({
              ...prev,
              customerType: GUEST,
            }));
          }
        },
      });
    } catch (error) {
      reset();
    }
  };

  return (
    <div className='grid w-full h-full col-span-1 p-1 border border-gray-500 border-solid justify-items-stretch'>
      {openDialog && (
        <UpdateVehicleTypeDialog
          open={true}
          info={updateVehicleInfo}
          onOpenChange={handleOpenDialogChange}
        />
      )}
      <CameraSection
        frontImage={checkInInfo.plateImgSrc}
        backImage={checkInInfo.plateImgSrc}
        plateCameRef={plateCamRef}
        bodyCameRef={bodyCamRef}
        isLoading={
          plateDetectionMutation.isPending ||
          isCustomerCheckingIn ||
          isGuestCheckingIn
        }
        deviceId={props.deviceId}
      />
      <VehicleForm
        methods={methods}
        isLoading={
          plateDetectionMutation.isPending ||
          isCustomerCheckingIn ||
          isGuestCheckingIn
        }
        onCheckIn={onCheckIn}
        onVehicleTypeChange={handleVehicleTypeChange}
        checkInInfo={checkInInfo}
      />
    </div>
  );
}

export default memo(CheckInSection);
