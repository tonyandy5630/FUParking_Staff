import React, { memo, useCallback, useRef, useState } from "react";
import CameraSection from "../CameraSection";
import Lane from "../CameraSection/Lane";
import Frame from "../CameraSection/Frame";
import Webcam from "react-webcam";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import CheckOutSchema from "@utils/schema/checkoutSchema";
import { useMutation } from "@tanstack/react-query";
import { checkOutAPI, checkOutPaymentAPI } from "@apis/check-out.api";
import FormInput from "@components/Form/Input";
import { Button } from "@components/ui/button";
import { CheckOut, CheckOutResponse } from "@my_types/check-out";
import { base64StringToFile } from "@utils/file";
import { ErrorResponse, SuccessResponse } from "@my_types/index";
import {
  NEED_TO_PAY,
  PLATE_NUMBER_NOT_MATCHED,
} from "@constants/error-message.const";
import FormItem from "../CameraSection/Form/FormItem";
import FormBox from "../CameraSection/Form/FormBox";
import toLocaleDate, { getLocalISOString } from "@utils/date";
import { licensePlateAPI } from "@apis/license.api";
import { LicenseResponse } from "@my_types/license";
import { DEFAULT_GUEST, GuestType } from "@constants/customer.const";
import Image from "@components/Image";
import useSelectGate from "../../hooks/useSelectGate";
import { GATE_OUT } from "@constants/gate.const";
import CheckOutVehicleForm from "@components/CheckOutVehicleForm";
import { SizeTypes } from "@my_types/my-camera";

export type Props = {
  deviceId: ConstrainDOMString | undefined;
  cameraSize?: SizeTypes;
  children: any;
  currentDevice: ConstrainDOMString | undefined;
  cardRef: React.RefObject<HTMLInputElement>;
};

export type CheckOutInfo = {
  plateImg: string;
  bodyImg: string;
  imgOut: string;
  plateText: string;
  cashToPay?: number;
  checkOutCardText: string;
  customerType: GuestType;
  needPay: boolean;
  timeIn: string;
  timeOut: string;
};

const initCheckOutInfo: CheckOutInfo = {
  plateImg: "",
  bodyImg: "",
  imgOut: "",
  plateText: "",
  cashToPay: 0,
  checkOutCardText: "",
  customerType: DEFAULT_GUEST,
  needPay: false,
  timeIn: "",
  timeOut: "",
};

function CheckoutSection({ cameraSize = "sm", ...props }: Props) {
  const { gateId } = useSelectGate(GATE_OUT);
  const plateCamRef = useRef(null);
  const bodyCamRef = useRef(null);
  const [checkOutInfo, setCheckOutInfo] =
    useState<CheckOutInfo>(initCheckOutInfo);
  const [message, setMessage] = useState("");
  const checkOutCardRef = useRef<HTMLInputElement>(null);
  const plateRef = useRef<HTMLInputElement>(null);
  const methods = useForm({
    resolver: yupResolver(CheckOutSchema),
    defaultValues: {
      GateOutId: gateId,
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
    setCheckOutInfo((prev) => ({ ...prev, plateText: e.target.value }));
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
            setCheckOutInfo((prev) => ({ ...prev, cashToPay: 0 }));
          },
        });
      }
    } catch (error) {
      reset({ CardNumber: "" });
      setMessage("LỖI HỆ THỐNG");
    } finally {
      setCheckOutInfo((prev) => ({ ...prev, needPay: false }));
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
      const imageSrc = checkOutInfo.imgOut;
      const file = base64StringToFile(imageSrc, "uploaded_image.png");

      checkOutBody.append("PlateNumber", checkOutInfo.plateText);
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
              plateImg: imageIn,
              cashToPay: amount,
              plateText: plateNumber,
              timeIn: toLocaleDate(new Date(timeIn)),
              customerType: typeOfCustomer,
              timeOut: toLocaleDate(new Date()),
            }));
            if (plateNumber === checkOutInfo.plateText) {
              setMessage("BIỂN SỐ TRÙNG KHỚP");
            } else {
              setMessage("BIỂN SỐ KHÔNG TRÙNG KHỚP");
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
    } catch (error) {
      console.log(error);
    }
  };

  const onCheckOut = async (checkOutData: CheckOut) => {
    try {
      console.log(checkOutData);
      if (!plateCamRef.current || !bodyCamRef.current) {
        setMessage("KHÔNG TÌM THẤY CAMERA");
      }
      const plateNumberBody = new FormData();
      const plateImageSrc = (plateCamRef.current as any).getScreenshot();
      const bodyImageSrc = (plateCamRef.current as any).getScreenshot();
      const plateFile = base64StringToFile(plateImageSrc, "uploaded_image.png");
      const bodyFile = base64StringToFile(bodyImageSrc, "uploaded_image.png");

      plateNumberBody.append("upload", plateFile);
      plateNumberBody.append("regions", "vn");
      const current = getLocalISOString(new Date());

      let plateRead = "";

      await plateDetectionMutation.mutateAsync(plateNumberBody, {
        onSuccess: (plateDetectionRes: SuccessResponse<LicenseResponse>) => {
          setCheckOutInfo((prev) => ({ ...prev, imgOut: plateImageSrc }));
          plateRead = plateDetectionRes.data.results[0].plate.toUpperCase();
        },
      });

      const checkOutBody = new FormData();
      checkOutBody.append(
        "CardNumber",
        (checkOutCardRef.current?.value as string) ??
          checkOutInfo.checkOutCardText
      );
      checkOutBody.append("PlateNumber", plateRead);
      checkOutBody.append("ImageOut", plateFile);
      checkOutBody.append("TimeOut", current);
      checkOutBody.append("ImageBody", bodyFile);
      checkOutBody.append("GateOutId", checkOutData.GateOutId ?? "");
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
              plateImg: imageIn,
              bodyImg: bodyImageSrc,
              cashToPay: amount,
              plateText: plateNumber,
              timeIn: toLocaleDate(new Date(timeIn)),
              customerType: typeOfCustomer as GuestType,
              timeOut: toLocaleDate(new Date()),
            }));
            if (plateNumber === plateRead) {
              setMessage("BIỂN SỐ TRÙNG KHỚP");
            } else {
              setMessage("BIỂN SỐ KHÔNG TRÙNG KHỚP");
            }
          }

          if (isNeedToPay) {
            setCheckOutInfo((prev) => ({ ...prev, needPay: true }));
          } else {
            reset({ CardNumber: "" });
          }
        },
        onError: (error: any) => {
          if (error.response.data.message === PLATE_NUMBER_NOT_MATCHED) {
            setCheckOutInfo((prev) => ({
              ...prev,
              plateText: plateRead,
            }));
            if (plateRef.current) plateRef.current.focus();
            setMessage("BIỂN SỐ KHÔNG TRÙNG KHỚP");
          }
        },
      });
    } catch (error) {
      console.log(error);
    }
  };
  const resetInfo = () => {
    setMessage("");
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
        frontImage={checkOutInfo.plateImg}
        backImage={checkOutInfo.plateImg}
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
      />
    </div>
  );
}

export default memo(CheckoutSection);
