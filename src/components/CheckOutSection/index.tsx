import React, { useCallback, useEffect, useRef, useState } from "react";
import CameraSection from "../CameraSection";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import CheckOutSchema from "@utils/schema/checkoutSchema";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  checkOutAPI,
  checkOutPaymentAPI,
  getCardCheckOutAPI,
  getCardCheckOutInfoByPlateAPI,
  missingCardCheckOutAPI,
} from "@apis/check-out.api";
import { CheckOut, CheckOutInfo, CheckOutResponse } from "@my_types/check-out";
import { base64StringToFile } from "@utils/file";
import {
  ErrorResponse,
  ErrorResponseAPI,
  SuccessResponse,
} from "@my_types/index";
import {
  CONFLICT_ERROR,
  EMPTY_INFO_CARD,
  NEED_TO_PAY,
} from "@constants/error-message.const";
import { licensePlateAPI } from "@apis/license.api";
import { LicenseResponse } from "@my_types/license";
import { GuestType } from "@constants/customer.const";
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
  PLATE_NOT_VALID,
  PLEASE_CHECK_OUT,
  SLOW_DOWN_ACTION,
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
import ParkingContainer from "@components/ParkingContainer";
import CardInfoRow from "@components/SessionCard/CardInfo";
import { PLATE_NUMBER_REGEX } from "@constants/regex";

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
  const [triggerInfoByCard, setTriggerInfoByCard] = useState(false);
  const [triggerGetInfoByPlateNumber, setTriggerGetInfoByPlateNumber] =
    useState<boolean>(false);
  const [timeOut, setTimeOut] = useState("");
  const checkOutInfo = useSelector(
    (cardInfo: RootState) => cardInfo.checkOutCard
  );
  const dispatch = useDispatch();
  const methods = useForm({
    resolver: yupResolver(CheckOutSchema),
    defaultValues: {
      GateOutId: gateId,
      CardNumber: "",
      PlateNumber: "",
    },
    values: {
      GateOutId: gateId,
    },
  });

  const {
    formState: { errors },
    reset,
    watch,
    getValues,
    setFocus,
  } = methods;

  const handleResetForm = () => {
    reset();
    setTimeOut("");
    setTriggerInfoByCard(false);
    dispatch(resetCurrentCardInfo());
    setFocus("CardNumber");
  };

  const {
    data: cardByPlateData,
    isLoading: isLoadingCardByPlate,
    isSuccess: isSuccessCardByPlate,
    isError: isErrorCardByPlate,
  } = useQuery({
    queryKey: [
      "/get-checkout-card-info-by-plate",
      watch("PlateNumber"),
      timeOut,
    ],
    queryFn: () =>
      getCardCheckOutInfoByPlateAPI(
        watch("PlateNumber") ?? "",
        getLocalISOString(new Date(timeOut))
      ),
    enabled: triggerGetInfoByPlateNumber,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
    gcTime: 0,
  });

  const {
    data: cardData,
    isLoading: isLoadingCardInfo,
    isSuccess: isSuccessCardInfo,
    isError: isErrorCardInfo,
    error,
  } = useQuery({
    queryKey: [
      "/get-checkout-card-info-session",
      watch("CardNumber")?.toString(),
      timeOut,
    ],
    queryFn: () =>
      getCardCheckOutAPI(
        watch("CardNumber") ?? "",
        getLocalISOString(new Date(timeOut))
      ),
    enabled: triggerInfoByCard,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
    gcTime: 0,
  });

  const handleTriggerGetInfoByPlate = () => {
    const current = new Date();
    setTimeOut(current.toString());
    setTriggerGetInfoByPlateNumber((prev) => !prev);
  };

  useEffect(() => {
    const isValidCard = watch("CardNumber")?.length === 10;
    if (isValidCard) {
      const current = new Date();
      setTimeOut(current.toString());
      setTriggerInfoByCard(true);
      dispatch(
        setNewCardInfo({ ...checkOutInfo, timeOut: current.toString() })
      );
      return;
    }
    setTriggerInfoByCard(false);
  }, [watch("CardNumber")?.length]);

  const checkOutMutation = useMutation({
    mutationKey: ["check-out"],
    mutationFn: checkOutAPI,
  });

  const paymentMutation = useMutation({
    mutationKey: ["payment"],
    mutationFn: checkOutPaymentAPI,
  });

  const {
    mutateAsync: mutateMissingCardAsync,
    isPending: isPendingMissingCardCheckOut,
  } = useMutation({
    mutationKey: ["/missing-card-check-out"],
    mutationFn: missingCardCheckOutAPI,
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

  useEffect(() => {
    if (error?.message === CONFLICT_ERROR)
      dispatch(
        setNewCardInfo({
          ...initCheckOutInfo,
          message: CARD_NOT_INFO,
          isError: true,
        })
      );
  }, [error]);

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
  }, [checkOutInfo, watch("CardNumber")]);

  const handlePlateDetection = useCallback(() => {
    let plateImgOut = "";
    try {
      // if (!plateCamRef.current || !bodyCamRef.current) {
      //   dispatch(setInfoMessage({ message: CAMERA_NOT_FOUND, isError: true }));
      //   return false; // Early return if cameras are not found
      // }

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
                plateImgOut: plateImageSrc,
                bodyImgOut: bodyImageSrc,
                timeOut: new Date().toString(),
                isError: true,
              })
            );
            setTriggerInfoByCard(false);
            throw new Error("Plate data not found");
          }
          setTriggerInfoByCard(false);
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
      const err = error as AxiosError;
      if (err.response) {
        if (err.response.status === HttpStatusCode.TooManyRequests) {
          dispatch(
            setNewCardInfo({
              ...initCheckOutInfo,
              message: SLOW_DOWN_ACTION,
              isError: true,
            })
          );
          reset();
          return false;
        }
      }
      return false;
    }
  }, [dispatch, plateCamRef, bodyCamRef, checkOutInfo]);
  // Effect for plate detection
  useEffect(() => {
    if (!cardData?.data?.data && !cardByPlateData?.data.data) {
      return;
    }
    handlePlateDetection();
  }, [cardData?.data?.data, cardByPlateData?.data.data]);

  useEffect(() => {
    if (isErrorCardInfo || isErrorCardByPlate) {
      setTriggerGetInfoByPlateNumber(false);
      setTriggerInfoByCard(false);
      reset();
    }
  }, [isErrorCardInfo, isErrorCardByPlate]);

  // Effect for updating card info based on cardByPlate
  useEffect(() => {
    const plateNumber = watch("PlateNumber");
    if (!plateNumber) {
      return;
    }

    if (!PLATE_NUMBER_REGEX.test(plateNumber)) {
      dispatch(
        setNewCardInfo({
          ...checkOutInfo,
          message: PLATE_NOT_VALID,
          plateTextOut: plateNumber,
          isError: true,
        })
      );
      return;
    }

    const cardInfo = cardByPlateData?.data?.data;
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
        plateImgIn: cardInfo.imageInUrl,
        timeIn: new Date(cardInfo.timeIn).toString(),
        plateTextIn: cardInfo.plateNumber,
        customerType: cardInfo.vehicleType,
        plateTextOut: checkOutInfo.plateTextOut,
        isError: !isPlateMatched,
        bodyImgIn: cardInfo.imageInBodyUrl,
        message,
      })
    );
    // }
  }, [
    cardByPlateData?.data?.data,
    checkOutInfo,
    dispatch,
    watch("PlateNumber"),
  ]);
  // Effect for updating card info based on cardData
  useEffect(() => {
    const cardNumber = watch("CardNumber")?.toString();

    if (!cardNumber) {
      return () => {};
    }

    if (cardNumber.length > 10) {
      dispatch(setInfoMessage({ message: SLOW_DOWN_ACTION, isError: true }));
      setTimeout(() => {
        reset();
      }, 500);
      return;
    }

    if (cardNumber.length < 10) {
      return () => {};
    }
    // handleTriggerGetInfoByCardNumber();
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
    setTriggerInfoByCard(false);

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
  const handleCheckOutMissingCard = async () => {
    try {
      const plateNumber = watch("PlateNumber") as string;
      dispatch(
        setNewCardInfo({
          ...checkOutInfo,
          plateTextOut: plateNumber,
        })
      );

      if (!PLATE_NUMBER_REGEX.test(plateNumber)) {
        dispatch(
          setNewCardInfo({
            ...checkOutInfo,
            plateTextOut: plateNumber,
            message: PLATE_NOT_VALID,
            isError: true,
          })
        );
        return;
      }

      const bodyImageFile = base64StringToFile(
        checkOutInfo.bodyImgOut,
        "uploaded_image.png"
      );
      const plateImageFile = base64StringToFile(
        checkOutInfo.plateImgOut,
        "uploaded_image.png"
      );

      const checkOutBody = new FormData();

      const current = getLocalISOString(
        new Date(checkOutInfo.timeOut as string)
      );

      checkOutBody.append("PlateNumber", plateNumber);
      checkOutBody.append("ImagePlate", plateImageFile);
      checkOutBody.append("CheckOutTime", current);
      checkOutBody.append("ImageBody", bodyImageFile);
      checkOutBody.append("GateId", gateId);
      await mutateMissingCardAsync(checkOutBody as any, {
        onSuccess: (res) => {
          reset({ PlateNumber: "" });
          dispatch(resetCurrentCardInfo());
          setTriggerGetInfoByPlateNumber(false);
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

  const onCheckOut = async (checkOutData: CheckOut) => {
    try {
      const bodyFile = base64StringToFile(
        checkOutInfo.bodyImgOut,
        "uploaded_image.png"
      );
      const plateFile = base64StringToFile(
        checkOutInfo.plateImgOut,
        "uploaded_image.png"
      );

      const current = getLocalISOString(
        new Date(checkOutInfo.timeOut as string)
      );

      const checkOutBody = new FormData();
      checkOutBody.append("CardNumber", checkOutData.CardNumber);
      checkOutBody.append("PlateNumber", checkOutInfo.plateTextOut);
      checkOutBody.append("ImageOut", plateFile);
      checkOutBody.append("TimeOut", current);
      checkOutBody.append("ImageBody", bodyFile);
      checkOutBody.append("GateOutId", gateId);
      await checkOutMutation.mutateAsync(checkOutBody as any, {
        onSuccess: async (res: ErrorResponse<CheckOutResponse>) => {
          setTriggerInfoByCard(false);

          reset({ CardNumber: "" });
          dispatch(resetCurrentCardInfo());
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
    <ParkingContainer>
      <CameraSection
        imageSrc={checkOutInfo.plateImgIn}
        bodyImageSrc={checkOutInfo.bodyImgIn}
        plateCameRef={plateCamRef}
        bodyCameRef={bodyCamRef}
        plateImageOut={checkOutInfo.plateImgOut}
        bodyImageOut={checkOutInfo.bodyImgOut}
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
            isLoadingCardInfo ||
            isPendingMissingCardCheckOut ||
            isLoadingCardByPlate
          }
          onCheckOut={onCheckOut}
          checkOutInfo={checkOutInfo}
          onCashCheckOut={handleCheckOutPayment}
          isError={checkOutInfo.isError}
          position={props.position}
          onMissingCardCheckOut={handleCheckOutMissingCard}
          onTriggerGetInfoByPlate={handleTriggerGetInfoByPlate}
          onReset={handleResetForm}
        />
      </HotkeysProvider>
    </ParkingContainer>
  );
}

export default CheckoutSection;
