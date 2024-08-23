import React, { useCallback, useRef, useState } from "react";
import CameraSection from "../CameraSection";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import CheckOutSchema from "@utils/schema/checkoutSchema";
import { useMutation } from "@tanstack/react-query";
import { checkOutAPI, checkOutPaymentAPI } from "@apis/check-out.api";
import { CheckOut, CheckOutResponse } from "@my_types/check-out";
import { base64StringToFile } from "@utils/file";
import { ErrorResponse, SuccessResponse } from "@my_types/index";
import {
  EMPTY_INFO_CARD,
  NEED_TO_PAY,
  PLATE_NUMBER_NOT_MATCHED,
} from "@constants/error-message.const";
import { licensePlateAPI } from "@apis/license.api";
import { LicenseResponse } from "@my_types/license";
import { DEFAULT_GUEST, GuestType } from "@constants/customer.const";
import useSelectGate from "../../hooks/useSelectGate";
import { GATE_OUT } from "@constants/gate.const";
import CheckOutVehicleForm from "@components/CheckOutVehicleForm";
import { SizeTypes } from "@my_types/my-camera";
import {
  CARD_NOT_INFO,
  GUEST_EXIT_SUCCESSFULLY,
  PLATE_MATCH,
  PLATE_NOT_MATCH,
  PLATE_NOT_READ,
} from "@constants/message.const";
import { getLocalISOString } from "@utils/date";

export type Props = {
  deviceId: ConstrainDOMString | undefined;
  cameraSize?: SizeTypes;
  children: any;
  currentDevice: ConstrainDOMString | undefined;
  cardRef: React.RefObject<HTMLInputElement>;
};

export type CheckOutInfo = {
  plateImgIn: string;
  plateImgOut: string;
  bodyImg: string;
  plateTextIn: string;
  plateTextOut: string;
  cashToPay?: number;
  checkOutCardText: string;
  customerType: GuestType;
  needPay: boolean;
  timeIn?: Date;
  timeOut?: Date;
  message: string;
  isError?: boolean;
};

const initCheckOutInfo: CheckOutInfo = {
  plateImgIn: "",
  plateImgOut: "",
  bodyImg: "",
  plateTextIn: "",
  plateTextOut: "",
  cashToPay: 0,
  checkOutCardText: "",
  customerType: DEFAULT_GUEST,
  needPay: false,
  timeIn: undefined,
  timeOut: undefined,
  message: "",
  isError: false,
};

function CheckoutSection({ cameraSize = "sm", ...props }: Props) {
  const { gateId } = useSelectGate(GATE_OUT);
  const plateCamRef = useRef(null);
  const bodyCamRef = useRef(null);
  const [checkOutInfo, setCheckOutInfo] =
    useState<CheckOutInfo>(initCheckOutInfo);
  const checkOutCardRef = useRef<HTMLInputElement>(null);
  const methods = useForm({
    resolver: yupResolver(CheckOutSchema),
    defaultValues: {
      GateOutId: gateId,
      CardNumber: "",
    },
    values: {
      GateOutId: gateId,
    },
  });

  const {
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    getValues,
  } = methods;

  const checkOutMutation = useMutation({
    mutationKey: ["check-out"],
    mutationFn: checkOutAPI,
  });

  const paymentMutation = useMutation({
    mutationKey: ["payment"],
    mutationFn: checkOutPaymentAPI,
  });

  const handleChangePlateTxt = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setCheckOutInfo((prev) => ({ ...prev, plateTextIn: e.target.value }));
  };

  const {
    isError: isCheckOutError,
    isSuccess: isCheckoutSuccess,
    isPending: isCheckingOut,
  } = checkOutMutation;

  const plateDetectionMutation = useMutation({
    mutationKey: ["plate-detection-check-out"],
    mutationFn: licensePlateAPI,
  });

  const handleCheckOutPayment = useCallback(async () => {
    try {
      const { needPay, checkOutCardText } = checkOutInfo;
      if (needPay) {
        const data = (getValues("CardNumber") as string) ?? checkOutCardText;
        await paymentMutation.mutateAsync(data, {
          onSuccess: (res) => {
            reset({ CardNumber: "" });
            resetInfo();
            setCheckOutInfo((prev) => ({
              ...prev,
              cashToPay: 0,
              message: GUEST_EXIT_SUCCESSFULLY,
              isError: false,
            }));
          },
        });
      }
    } catch (error) {
      reset({ CardNumber: "" });
      setCheckOutInfo((prev) => ({
        ...prev,
        message: "Lỗi hệ thống",
        isError: true,
      }));
    } finally {
      setCheckOutInfo((prev) => ({ ...prev, needPay: false, isError: true }));
    }
  }, [
    paymentMutation.isPending,
    checkOutInfo.needPay,
    checkOutInfo.checkOutCardText,
  ]);

  const focusCardCheckOutInput = () => {
    if (checkOutCardRef.current) {
      checkOutCardRef.current?.focus();
    }
  };

  const handleFixPlate = async () => {
    try {
      const checkOutBody = new FormData();
      checkOutBody.append(
        "CardNumber",
        (checkOutCardRef.current?.value as string) ??
          checkOutInfo.checkOutCardText
      );
      const imageSrc = checkOutInfo.plateImgOut;
      const file = base64StringToFile(imageSrc, "uploaded_image.png");

      checkOutBody.append("PlateNumber", checkOutInfo.plateTextIn);
      checkOutBody.append("ImageOut", file);
      checkOutBody.append("TimeOut", getLocalISOString(new Date()));
      checkOutBody.append("GateOutId", gateId);

      await checkOutMutation.mutateAsync(checkOutBody as any, {
        onSuccess: (res) => {
          const isNeedToPay = res.data?.data.message === NEED_TO_PAY;
          if (res.data) {
            const {
              amount,
              imageIn,
              message,
              plateNumber,
              timeIn,
              typeOfCustomer,
            } = res.data.data;
            setCheckOutInfo((prev) => ({
              ...prev,
              plateImgIn: imageIn,
              cashToPay: amount,
              plateTextIn: plateNumber,
              timeIn: new Date(timeIn),
              customerType: typeOfCustomer,
              timeOut: new Date(),
            }));
            if (plateNumber === checkOutInfo.plateTextIn) {
              setCheckOutInfo((prev) => ({ ...prev, message: PLATE_MATCH }));
            } else {
              setCheckOutInfo((prev) => ({
                ...prev,
                message: PLATE_NOT_MATCH,
              }));
            }
          }

          if (isNeedToPay) {
            setCheckOutInfo((prev) => ({ ...prev, needPay: true }));
          } else {
            resetInfo();
            reset({ CardNumber: "" });
          }
        },
      });
    } catch (error: any) {
      if (error.response.data.message === EMPTY_INFO_CARD) {
        setCheckOutInfo((prev) => ({
          ...initCheckOutInfo,
          message: CARD_NOT_INFO,
        }));
      }
      console.log(error);
    }
  };

  const handlePlateDetection = () => {
    try {
      if (!plateCamRef.current || !bodyCamRef.current) {
        setCheckOutInfo((prev) => ({
          ...prev,
          message: "KHÔNG TÌM THẤY CAMERA",
        }));
      }
      const plateNumberBody = new FormData();
      const plateImageSrc = (plateCamRef.current as any).getScreenshot();
      const plateFile = base64StringToFile(plateImageSrc, "uploaded_image.png");

      plateNumberBody.append("upload", plateFile);
      plateNumberBody.append("regions", "vn");
      let plateRead = "";

      plateDetectionMutation.mutate(plateNumberBody, {
        onSuccess: (plateDetectionRes: SuccessResponse<LicenseResponse>) => {
          const plateData = plateDetectionRes.data.results[0];
          if (!plateData) {
            reset();
            throw new Error();
          }
          plateRead = plateData.plate.toUpperCase();
          setCheckOutInfo((prev) => ({
            ...prev,
            timeOut: new Date(),
            plateImgOut: plateImageSrc,
            plateTextOut: plateRead,
          }));
        },
      });
      return true;
    } catch (error) {
      setCheckOutInfo((prev) => ({
        ...initCheckOutInfo,
        message: PLATE_NOT_READ,
        isError: true,
      }));
      return false;
    }
  };

  const onCheckOut = async (checkOutData: CheckOut) => {
    try {
      if (!bodyCamRef.current) {
        setCheckOutInfo((prev) => ({
          ...initCheckOutInfo,
          message: "KHÔNG TÌM THẤY CAMERA",
          isError: true,
        }));
      }

      const bodyImageSrc = (bodyCamRef.current as any).getScreenshot();
      const bodyFile = base64StringToFile(bodyImageSrc, "uploaded_image.png");

      const current = getLocalISOString(new Date());

      const isPlateReadSuccess = handlePlateDetection();

      if (!isPlateReadSuccess) {
        return;
      }

      if (checkOutInfo.plateImgOut === "") {
        setCheckOutInfo(() => ({
          ...initCheckOutInfo,
          message: PLATE_NOT_READ,
          isError: true,
        }));
      }

      const plateFileOut = base64StringToFile(
        checkOutInfo.plateImgOut,
        "uploaded_image.png"
      );

      const checkOutBody = new FormData();
      checkOutBody.append("CardNumber", checkOutData.CardNumber);
      checkOutBody.append("PlateNumber", checkOutInfo.plateTextOut);
      checkOutBody.append("ImageOut", plateFileOut);
      checkOutBody.append("TimeOut", current);
      checkOutBody.append("ImageBody", bodyFile);
      checkOutBody.append("GateOutId", gateId);
      await checkOutMutation.mutateAsync(checkOutBody as any, {
        onSuccess: (res: ErrorResponse<CheckOutResponse>) => {
          const isNeedToPay = res.data?.data.message === NEED_TO_PAY;
          if (res.data) {
            const {
              amount,
              imageIn,
              message,
              plateNumber,
              timeIn,
              typeOfCustomer,
            } = res.data.data;
            setCheckOutInfo((prev) => ({
              ...prev,
              plateImgIn: imageIn,
              bodyImg: bodyImageSrc,
              plateImgOut: checkOutInfo.plateImgOut,
              cashToPay: amount,
              plateTextIn: plateNumber,
              plateTextOut: checkOutInfo.plateTextOut,
              timeIn: new Date(timeIn),
              customerType: typeOfCustomer as GuestType,
              timeOut: new Date(),
              isError: false,
            }));
            if (plateNumber === checkOutInfo.plateTextOut) {
              setCheckOutInfo((prev) => ({
                ...prev,
                message: PLATE_MATCH,
                isError: false,
              }));
            } else {
              reset();
              setCheckOutInfo((prev) => ({
                ...initCheckOutInfo,
                message: PLATE_NOT_MATCH,
                isError: true,
              }));
            }
          }

          if (isNeedToPay) {
            setCheckOutInfo((prev) => ({ ...prev, needPay: true }));
          } else {
            reset();
          }
        },
        onError: (error: any) => {
          reset();
          if (!error.response.data) {
            setCheckOutInfo((prev) => ({
              ...initCheckOutInfo,
              message: "Lỗi hệ thống",
              isError: true,
            }));
          }

          if (error.response.data.message === PLATE_NUMBER_NOT_MATCHED) {
            setCheckOutInfo(() => ({
              ...initCheckOutInfo,
              message: PLATE_NOT_MATCH,
              isError: true,
            }));
          }
        },
      });
    } catch (error: any) {
      if (!error.response.data) {
        setCheckOutInfo((prev) => ({
          ...initCheckOutInfo,
          message: "Lỗi hệ thống",
          isError: true,
        }));
      }
      const message = error.response.data.message;
      if (message === EMPTY_INFO_CARD) {
        setCheckOutInfo((prev) => ({
          ...initCheckOutInfo,
          message: CARD_NOT_INFO,
          isError: true,
        }));
      }
    }
  };
  const resetInfo = () => {
    setCheckOutInfo(initCheckOutInfo);
    focusCardCheckOutInput();
  };

  const handleFinishCheckOut = useCallback(
    async (e: React.KeyboardEvent<HTMLFormElement>) => {
      if (e.code === "Space" && checkOutInfo.needPay) {
        await handleCheckOutPayment();
      } else if (e.code === "Space") {
        resetInfo();
      }
    },
    [isCheckoutSuccess, checkOutInfo.needPay]
  );

  return (
    <div className='grid w-full h-full col-span-1 p-1 border border-gray-500 border-solid justify-items-stretch'>
      <CameraSection
        frontImage={checkOutInfo.plateImgIn}
        backImage={checkOutInfo.plateImgIn}
        plateCameRef={plateCamRef}
        bodyCameRef={bodyCamRef}
        isLoading={
          plateDetectionMutation.isPending ||
          checkOutMutation.isPending ||
          paymentMutation.isPending
        }
        deviceId={props.deviceId}
      />
      <CheckOutVehicleForm
        methods={methods}
        isLoading={
          plateDetectionMutation.isPending ||
          checkOutMutation.isPending ||
          paymentMutation.isPending
        }
        onCheckOut={onCheckOut}
        checkOutInfo={checkOutInfo}
        onCashCheckOut={handleCheckOutPayment}
        isError={checkOutInfo.isError}
      />
    </div>
  );
}

export default CheckoutSection;
