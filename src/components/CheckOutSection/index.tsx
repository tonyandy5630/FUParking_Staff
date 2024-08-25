import React, { useCallback, useEffect, useRef } from "react";
import CameraSection from "../CameraSection";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import CheckOutSchema from "@utils/schema/checkoutSchema";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  checkOutAPI,
  checkOutPaymentAPI,
  getCardCheckOutAPI,
} from "@apis/check-out.api";
import { CheckOut, CheckOutInfo, CheckOutResponse } from "@my_types/check-out";
import { base64StringToFile } from "@utils/file";
import {
  ErrorResponse,
  ErrorResponseAPI,
  SuccessResponse,
} from "@my_types/index";
import { EMPTY_INFO_CARD, NEED_TO_PAY } from "@constants/error-message.const";
import { licensePlateAPI } from "@apis/license.api";
import { LicenseResponse } from "@my_types/license";
import { DEFAULT_GUEST, GuestType } from "@constants/customer.const";
import useSelectGate from "../../hooks/useSelectGate";
import { GATE_OUT } from "@constants/gate.const";
import CheckOutVehicleForm from "./CheckOutVehicleForm";
import { SizeTypes } from "@my_types/my-camera";
import {
  CAMERA_NOT_FOUND,
  CARD_NOT_INFO,
  GUEST_EXIT_SUCCESSFULLY,
  PLATE_MATCH,
  PLATE_NOT_MATCH,
  PLATE_NOT_READ,
  PLEASE_CHECK_OUT,
} from "@constants/message.const";
import { getLocalISOString } from "@utils/date";
import { HotkeysProvider, useHotkeys } from "react-hotkeys-hook";
import { SUBMIT_LEFT_HOTKEY, SUBMIT_RIGHT_HOTKEY } from "../../hotkeys/key";
import PAGE from "../../../url";
import LanePosition from "@my_types/lane";
import LANE from "@constants/lane.const";
import { AxiosError, HttpStatusCode } from "axios";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@utils/store";
import {
  initCheckOutInfo,
  resetCurrentCardInfo,
  setInfoMessage,
  setNewCardInfo,
} from "../../redux/checkoutSlice";

export type Props = {
  plateDeviceId: ConstrainDOMString | undefined;
  bodyDeviceId: ConstrainDOMString | undefined;
  cameraSize?: SizeTypes;
  children: any;
  position: LanePosition;
};

function CheckoutSection({ bodyDeviceId, cameraSize = "sm", ...props }: Props) {
  const { gateId } = useSelectGate(GATE_OUT);
  const plateCamRef = useRef(null);
  const bodyCamRef = useRef(null);
  const checkOutInfo = useSelector(
    (cardInfo: RootState) => cardInfo.checkOutCard
  );
  const dispatch = useDispatch();
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
    reset,
    watch,
  } = methods;

  const {
    data: cardData,
    isLoading: isLoadingCardInfo,
    isSuccess: isSuccessCardInfo,
    isError: isErrorCardInfo,
  } = useQuery({
    queryKey: ["/get-checkout-card-info", watch("CardNumber")],
    queryFn: () => getCardCheckOutAPI(watch("CardNumber") ?? ""),
    enabled:
      watch("CardNumber") !== undefined && watch("CardNumber")?.length === 10,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
    gcTime: 0,
  });

  const checkOutMutation = useMutation({
    mutationKey: ["check-out"],
    mutationFn: checkOutAPI,
  });

  const paymentMutation = useMutation({
    mutationKey: ["payment"],
    mutationFn: checkOutPaymentAPI,
  });

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
      const data = watch("CardNumber") as string;
      await paymentMutation.mutateAsync(data, {
        onSuccess: (res) => {
          reset({ CardNumber: "" });
          // resetInfo();
          dispatch(resetCurrentCardInfo());
        },
      });
    } catch (error) {
      dispatch(
        setNewCardInfo({
          ...checkOutInfo,
          plateTextOut: "",
          cashToPay: 0,
          message: "Lỗi hệ thống",
          isError: true,
        })
      );
    }
  }, [checkOutInfo]);

  const handlePlateDetection = useCallback(() => {
    let plateImgOut = "";
    try {
      if (!plateCamRef.current || !bodyCamRef.current) {
        dispatch(setInfoMessage({ message: CAMERA_NOT_FOUND, isError: true }));
        return false; // Early return if cameras are not found
      }

      const plateNumberBody = new FormData();
      const plateImageSrc = (plateCamRef.current as any).getScreenshot();
      const bodyImageSrc = (bodyCamRef.current as any).getScreenshot();
      plateImgOut = plateImageSrc;
      const plateFile = base64StringToFile(plateImageSrc, "uploaded_image.png");

      plateNumberBody.append("upload", plateFile);
      plateNumberBody.append("regions", "vn");

      plateDetectionMutation.mutate(plateNumberBody, {
        onSuccess: (plateDetectionRes: SuccessResponse<LicenseResponse>) => {
          const plateData = plateDetectionRes.data.results[0];

          if (!plateData) {
            dispatch(
              setNewCardInfo({
                ...initCheckOutInfo,
                message: PLATE_NOT_READ,
                plateImgOut,
                bodyImgOut: bodyImageSrc,
                isError: true,
              })
            );
            throw new Error("Plate data not found");
          }

          const plateRead = plateData.plate.toUpperCase();
          dispatch(
            setNewCardInfo({
              ...checkOutInfo,
              timeOut: new Date().toString(),
              plateImgOut: plateImageSrc,
              plateTextOut: plateRead,
              bodyImgOut: bodyImageSrc,
            })
          );
        },
      });

      return true;
    } catch (error) {
      return false;
    }
  }, [dispatch, plateCamRef, bodyCamRef, checkOutInfo, plateDetectionMutation]);
  // Effect for plate detection
  useEffect(() => {
    if (!cardData?.data?.data) return;
    handlePlateDetection();
  }, [cardData?.data?.data]);

  useEffect(() => {
    if (isErrorCardInfo) {
      reset();
    }
  }, [isErrorCardInfo, watch("CardNumber")]);

  // Effect for updating card info based on cardData
  useEffect(() => {
    const cardNumber = watch("CardNumber");
    if (!cardNumber) {
      return;
    }

    if (cardNumber.length > 10) {
      dispatch(setInfoMessage({ message: PLEASE_CHECK_OUT, isError: true }));
      return;
    }

    const cardInfo = cardData?.data?.data;
    if (!cardInfo) {
      dispatch(
        setNewCardInfo({
          ...checkOutInfo,
          message: CARD_NOT_INFO,
          isError: true,
        })
      );
      return;
    }

    const needPay = cardInfo.isEnoughToPay ?? false;
    const isPlateMatched = cardInfo.plateNumber === checkOutInfo.plateTextOut;
    const message =
      checkOutInfo.plateImgOut === ""
        ? PLATE_NOT_READ
        : isPlateMatched
        ? PLATE_MATCH
        : PLATE_NOT_MATCH;

    // Check if there's any actual change in state before dispatching

    dispatch(
      setNewCardInfo({
        ...checkOutInfo,
        cashToPay: cardInfo.amount,
        needPay,
        timeOut: new Date().toString(),
        plateImgIn: cardInfo.imageInUrl,
        timeIn: new Date(cardInfo.timeIn).toString(),
        plateTextIn: cardInfo.plateNumber,
        plateImgOut: checkOutInfo.plateImgOut,
        bodyImgOut: checkOutInfo.bodyImgOut,
        customerType: cardInfo.vehicleType,
        plateTextOut: checkOutInfo.plateTextOut,
        isError: !isPlateMatched,
        bodyImgIn: cardInfo.imageInBodyUrl,
        message,
      })
    );
    // }
  }, [cardData?.data?.data, checkOutInfo, dispatch, watch("CardNumber")]);

  const onCheckOut = async (checkOutData: CheckOut) => {
    try {
      if (!bodyCamRef.current) {
        reset();
        dispatch(
          setNewCardInfo({
            ...checkOutInfo,
            message: "KHÔNG TÌM THẤY CAMERA",
            isError: true,
          })
        );
      }
      const plateImageSrc = (plateCamRef.current as any).getScreenshot();
      const bodyFile = base64StringToFile(
        checkOutInfo.bodyImgOut,
        "uploaded_image.png"
      );
      const plateFile = base64StringToFile(plateImageSrc, "uploaded_image.png");

      const current = getLocalISOString(new Date());

      const checkOutBody = new FormData();
      checkOutBody.append("CardNumber", checkOutData.CardNumber);
      checkOutBody.append("PlateNumber", checkOutInfo.plateTextOut);
      checkOutBody.append("ImageOut", plateFile);
      checkOutBody.append("TimeOut", current);
      checkOutBody.append("ImageBody", bodyFile);
      checkOutBody.append("GateOutId", gateId);
      await checkOutMutation.mutateAsync(checkOutBody as any, {
        onSuccess: async (res: ErrorResponse<CheckOutResponse>) => {
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
            dispatch(
              setNewCardInfo({
                ...checkOutInfo,
                plateImgIn: imageIn,
                bodyImgOut: checkOutInfo.bodyImgOut,
                plateImgOut: plateImageSrc,
                cashToPay: amount,
                plateTextIn: plateNumber,
                plateTextOut: checkOutInfo.plateTextOut,
                timeIn: new Date(timeIn).toString(),
                customerType: typeOfCustomer as GuestType,
                timeOut: new Date().toString(),
                isError: false,
              })
            );
            if (plateNumber === checkOutInfo.plateTextOut) {
              dispatch(
                setNewCardInfo({
                  ...checkOutInfo,
                  message: PLATE_MATCH,
                  isError: false,
                })
              );
            } else {
              dispatch(
                setNewCardInfo({
                  ...checkOutInfo,
                  message: PLATE_NOT_MATCH,
                  isError: true,
                })
              );
            }
          }
          if (isNeedToPay) {
            dispatch(
              setNewCardInfo({
                ...checkOutInfo,
                needPay: true,
              })
            );

            await handleCheckOutPayment();
          }
        },
        onError: (err: unknown) => {
          const error = err as AxiosError<ErrorResponseAPI>;
          reset();
          if (!error.response?.data) {
            dispatch(
              setNewCardInfo({
                ...checkOutInfo,
                message: "Lỗi hệ thống",
                isError: true,
              })
            );
          }
          const message = error.response?.data.message;
          if (message === EMPTY_INFO_CARD) {
            dispatch(
              setNewCardInfo({
                ...checkOutInfo,
                message: CARD_NOT_INFO,
                isError: true,
              })
            );
          }
        },
      });
    } catch (err: unknown) {
      const error = err as AxiosError<ErrorResponseAPI>;
      if (!error.response?.data) {
        dispatch(
          setNewCardInfo({
            ...checkOutInfo,
            message: "Lỗi hệ thống",
            isError: true,
          })
        );
      }
    }
  };

  return (
    <div className='grid w-full h-full col-span-1 p-1 border border-gray-500 border-solid justify-items-stretch'>
      <CameraSection
        frontImage={checkOutInfo.plateImgIn}
        backImage={checkOutInfo.bodyImgIn}
        plateCameRef={plateCamRef}
        bodyCameRef={bodyCamRef}
        isLoading={
          plateDetectionMutation.isPending ||
          checkOutMutation.isPending ||
          paymentMutation.isPending
        }
        plateDeviceId={props.plateDeviceId}
        bodyDeviceId={bodyDeviceId}
      />
      <HotkeysProvider
        initiallyActiveScopes={[PAGE.CHECK_OUT, props.position]}
        key={LANE.LEFT}
      >
        <CheckOutVehicleForm
          methods={methods}
          isLoading={
            plateDetectionMutation.isPending ||
            isCheckingOut ||
            paymentMutation.isPending ||
            isLoadingCardInfo
          }
          onCheckOut={onCheckOut}
          checkOutInfo={checkOutInfo}
          onCashCheckOut={handleCheckOutPayment}
          isError={checkOutInfo.isError}
          position={props.position}
        />
      </HotkeysProvider>
    </div>
  );
}

export default CheckoutSection;
