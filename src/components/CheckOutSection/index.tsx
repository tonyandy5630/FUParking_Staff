import { useCallback, useEffect, useRef, useState } from "react";
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
import { CheckOut, CheckOutResponse } from "@my_types/check-out";
import { base64StringToFile } from "@utils/file";
import {
  ErrorResponse,
  ErrorResponseAPI,
  SuccessResponse,
} from "@my_types/index";
import {
  CONFLICT_ERROR,
  EMPTY_INFO_CARD,
  NOT_FOUND_SESSION_WITH_CARD_ERROR,
  PLATE_IN_OTHER_SESSION_ERROR,
} from "@constants/error-message.const";
import { licensePlateAPI } from "@apis/license.api";
import { LicenseResponse } from "@my_types/license";
import {
  APP_CUSTOMER,
  GUEST_CUSTOMER,
  NEXT_CUSTOMER,
  PAID_CUSTOMER,
} from "@constants/customer.const";
import CheckOutVehicleForm from "./CheckOutVehicleForm";
import { SizeTypes } from "@my_types/my-camera";
import {
  CARD_NOT_INFO,
  IS_NOT_ENOUGH_TO_PAY,
  PLATE_MATCH,
  PLATE_NOT_MATCH,
  PLATE_NOT_READ,
  PLATE_NOT_VALID,
  SLOW_DOWN_ACTION,
  VEHICLE_IN_OTHER_SESSION,
} from "@constants/message.const";
import { getLocalISOString } from "@utils/date";
import { HotkeysProvider } from "react-hotkeys-hook";
import PAGE from "../../../url";
import LanePosition from "@my_types/lane";
import LANE from "@constants/lane.const";
import { AxiosError, HttpStatusCode } from "axios";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@utils/store";
import {
  initCheckOutInfo,
  resetCurrentCardInfo,
  setInfoMessage,
  setNewCardInfo,
} from "../../redux/checkoutSlice";
import ParkingContainer from "@components/ParkingContainer";
import cropImageToBase64 from "@utils/image";
import { isValidPlateNumber, unFormatPlateNumber } from "@utils/plate-number";

export type Props = {
  plateDeviceId: ConstrainDOMString | undefined;
  bodyDeviceId: ConstrainDOMString | undefined;
  cameraSize?: SizeTypes;
  children: any;
  position: LanePosition;
};

function CheckoutSection({ bodyDeviceId, cameraSize = "sm", ...props }: Props) {
  const gateId = useAppSelector((state) => state.gateOut);
  const plateCamRef = useRef(null);
  const bodyCamRef = useRef(null);
  const triggerInfoByCard = useRef(false);
  const triggerGetInfoByPlateNumber = useRef<boolean>(false);
  const [timeOut, setTimeOut] = useState("");
  const checkOutInfo = useAppSelector((cardInfo) => cardInfo.checkOutCard);
  const dispatch = useDispatch();
  const isRunningAPI = useRef(false);
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

  const allowCheckOut = () => {
    if (isRunningAPI.current) isRunningAPI.current = false;
  };

  const notAllowCheckOut = () => {
    if (isRunningAPI.current === false) isRunningAPI.current = true;
  };

  const {
    formState: { errors },
    reset,
    watch,
    getValues,
    setFocus,
  } = methods;

  const handleResetForm = () => {
    setTimeOut("");
    triggerInfoByCard.current = false;
    triggerGetInfoByPlateNumber.current = false;
    allowCheckOut();
    dispatch(resetCurrentCardInfo());
    setFocus("CardNumber");
    reset();
  };

  const {
    data: cardByPlateData,
    isLoading: isLoadingCardByPlate,
    isSuccess: isSuccessCardByPlate,
    isError: isErrorCardByPlate,
    error: errorCardByPlate,
  } = useQuery({
    queryKey: [
      "/get-checkout-card-info-by-plate",
      watch("PlateNumber"),
      timeOut,
    ],
    queryFn: () =>
      getCardCheckOutInfoByPlateAPI(
        unFormatPlateNumber(watch("PlateNumber") ?? ""),
        getLocalISOString(new Date(timeOut))
      ),
    enabled: triggerGetInfoByPlateNumber.current,
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
    error: errorSessionByCard,
    refetch: refetchCardInfo,
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
    enabled: triggerInfoByCard.current,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 0,
    gcTime: 0,
  });

  const handleTriggerGetInfoByPlate = () => {
    const current = new Date();
    setTimeOut(current.toString());
    triggerGetInfoByPlateNumber.current = true;
  };

  useEffect(() => {
    const isValidCard = getValues("CardNumber")?.length === 10;
    if (isValidCard) {
      const current = new Date();
      setTimeOut(current.toString());
      //* query session info
      triggerInfoByCard.current = true;
      dispatch(
        setNewCardInfo({
          ...checkOutInfo,
          timeOut: current.toString(),
        })
      );
      return;
    }
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
  const { isSuccess: isCheckoutSuccess, isPending: isCheckingOut } =
    checkOutMutation;

  const plateDetectionMutation = useMutation({
    mutationKey: ["plate-detection-check-out"],
    mutationFn: licensePlateAPI,
  });

  useEffect(() => {
    if (errorSessionByCard?.message === CONFLICT_ERROR)
      dispatch(
        setNewCardInfo({
          ...initCheckOutInfo,
          message: CARD_NOT_INFO,
          isError: true,
        })
      );
  }, [errorSessionByCard]);

  useEffect(() => {
    //* reset on mount
    dispatch(resetCurrentCardInfo());
  }, []);

  const handlePlateDetection = useCallback(async () => {
    try {
      let plateImgOut = "";
      //* reset before do anything
      dispatch(resetCurrentCardInfo());
      const plateNumberBody = new FormData();
      const plateImageSrc = (plateCamRef.current as any).getScreenshot();
      const bodyImageSrc = (bodyCamRef.current as any).getScreenshot();
      plateImgOut = plateImageSrc;
      const plateFile = base64StringToFile(plateImageSrc, "uploaded_image.png");

      plateNumberBody.append("upload", plateFile);
      plateNumberBody.append("regions", "vn");
      await plateDetectionMutation.mutateAsync(plateNumberBody, {
        onSuccess: async (
          plateDetectionRes: SuccessResponse<LicenseResponse>
        ) => {
          const plateData = plateDetectionRes.data.results[0];
          let plateRead = "";
          let croppedImage = "";
          let message = "";

          if (!plateData) {
            message = PLATE_NOT_READ;
          } else {
            const cropCordinates = plateData.box;
            plateRead = plateData.plate.toUpperCase();
            croppedImage = await cropImageToBase64(
              plateImageSrc,
              cropCordinates
            );
          }
          dispatch(
            setNewCardInfo({
              ...checkOutInfo,
              timeOut: new Date().toString(),
              plateImgOut,
              plateTextOut: plateRead,
              bodyImgOut: bodyImageSrc,
              croppedImagePlate: croppedImage,
            })
          );
          triggerInfoByCard.current = false;
        },
      });
    } catch (error) {
      triggerInfoByCard.current = true;
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
  }, [
    dispatch,
    plateCamRef,
    bodyCamRef,
    triggerInfoByCard,
    watch("CardNumber"),
  ]);

  //* effect separate plate detection and check out
  useEffect(() => {
    if (!cardData?.data.data && !cardByPlateData?.data.data) return;

    handlePlateDetection();
  }, [cardData?.data.data, cardByPlateData?.data.data]);

  //* error effect by plate
  useEffect(() => {
    if (isErrorCardByPlate) {
      triggerGetInfoByPlateNumber.current = false;
      allowCheckOut();
      const sessionByPlateError =
        errorCardByPlate as AxiosError<ErrorResponseAPI>;

      //* unhandled error
      if (!sessionByPlateError.response) {
        dispatch(
          setNewCardInfo({
            ...initCheckOutInfo,
            message: "Lỗi hệ thống",
            isError: true,
          })
        );
        return;
      }

      //* error by get info by plate
      const sessionByPlateErrorResponse = sessionByPlateError.response;
      if (!sessionByPlateErrorResponse) {
        dispatch(
          setNewCardInfo({
            ...initCheckOutInfo,
            message: "Lỗi hệ thống",
            isError: true,
          })
        );
      }
      const errorMessageSessionByPlate =
        sessionByPlateErrorResponse?.data.message;
      if (errorMessageSessionByPlate === EMPTY_INFO_CARD) {
        dispatch(
          setNewCardInfo({
            ...initCheckOutInfo,
            message: CARD_NOT_INFO,
            isError: true,
          })
        );
      }
      reset();
    }
  }, [isErrorCardByPlate, triggerGetInfoByPlateNumber.current]);

  //* error effect by card
  useEffect(() => {
    //* allow checkout to run after error
    if (!isErrorCardInfo) {
      return;
    }

    const sessionByCardError =
      errorSessionByCard as AxiosError<ErrorResponseAPI>;

    const sessionByCardResponse = sessionByCardError.response;
    // reset({ CardNumber: "" });
    if (!sessionByCardResponse || sessionByCardResponse === null) {
      dispatch(
        setNewCardInfo({
          ...initCheckOutInfo,
          message: "Lỗi hệ thống",
          isError: true,
        })
      );
    }

    const errorMessageSessionByCard = sessionByCardResponse?.data.message;
    if (errorMessageSessionByCard === NOT_FOUND_SESSION_WITH_CARD_ERROR) {
      dispatch(
        setNewCardInfo({
          ...initCheckOutInfo,
          message: CARD_NOT_INFO,
          isError: true,
        })
      );
      return;
    }
  }, [isErrorCardInfo, errorSessionByCard]);

  //* Effect for updating card info based on cardByPlate
  useEffect(() => {
    const plateNumber = unFormatPlateNumber(
      watch("PlateNumber")?.toUpperCase()
    );
    if (!plateNumber) {
      return;
    }

    if (plateNumber.trim().length < 8) {
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
    const isValidPlate = isValidPlateNumber(plateNumber);

    if (!isValidPlate) {
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
    const isPlateMatched = cardInfo.plateNumber === checkOutInfo.plateTextOut;
    let message =
      checkOutInfo.plateImgOut === ""
        ? PLATE_NOT_READ
        : isPlateMatched
        ? PLATE_MATCH
        : PLATE_NOT_MATCH;

    let customerType = cardInfo.vehicleType;

    //* guest
    if (cardInfo.customerType !== PAID_CUSTOMER) {
      dispatch(
        setNewCardInfo({
          ...checkOutInfo,
          id: cardInfo.id,
          cashToPay: cardInfo.amount,
          plateImgIn: cardInfo.imageInUrl,
          timeIn: new Date(cardInfo.timeIn).toString(),
          plateTextIn: cardInfo.plateNumber,
          plateImgOut: checkOutInfo.plateImgOut,
          bodyImgOut: checkOutInfo.bodyImgOut,
          customerType,
          plateTextOut: checkOutInfo.plateTextOut,
          isError: !isPlateMatched, //* plate matched = no error
          bodyImgIn: cardInfo.imageInBodyUrl,
          message,
        })
      );
      return;
    }

    if (cardInfo.amount > 0) {
      message = IS_NOT_ENOUGH_TO_PAY;
    }
    // Check if there's any actual change in state before dispatching
    dispatch(
      setNewCardInfo({
        ...checkOutInfo,
        id: cardInfo.id,
        cashToPay: cardInfo.amount,
        plateImgIn: cardInfo.imageInUrl,
        timeIn: new Date(cardInfo.timeIn).toString(),
        plateTextIn: cardInfo.plateNumber,
        customerType: APP_CUSTOMER,
        plateTextOut: checkOutInfo.plateTextOut,
        isError: !isPlateMatched, //* plate matched = no error
        bodyImgIn: cardInfo.imageInBodyUrl,
        message,
      })
    );
    // }
  }, [
    cardByPlateData?.data?.data,
    dispatch,
    watch("PlateNumber"),
    checkOutInfo,
  ]);

  //* Effect for updating card info based on cardData
  useEffect(() => {
    const cardNumber = getValues("CardNumber")?.toString();
    if (!cardNumber) {
      return () => {};
    }

    if (cardNumber.length > 10) {
      dispatch(setInfoMessage({ message: SLOW_DOWN_ACTION, isError: true }));
      setTimeout(() => {
        handleResetForm();
      }, 500);
      return;
    }

    if (cardNumber.length < 10) {
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

    //* plate matched = no error
    const isPlateMatched = cardInfo.plateNumber === checkOutInfo.plateTextOut;
    let message =
      checkOutInfo.plateImgOut === ""
        ? PLATE_NOT_READ
        : isPlateMatched
        ? PLATE_MATCH
        : PLATE_NOT_MATCH;

    let customerType = cardInfo.vehicleType;
    if (
      cardInfo.customerType === GUEST_CUSTOMER ||
      cardInfo.customerType === ""
    ) {
      dispatch(
        setNewCardInfo({
          ...checkOutInfo,
          id: cardInfo.id,
          cashToPay: cardInfo.amount,
          plateImgIn: cardInfo.imageInUrl,
          timeIn: new Date(cardInfo.timeIn).toString(),
          plateTextIn: cardInfo.plateNumber,
          plateImgOut: checkOutInfo.plateImgOut,
          bodyImgOut: checkOutInfo.bodyImgOut,
          customerType,
          plateTextOut: checkOutInfo.plateTextOut,
          isError: !isPlateMatched,
          bodyImgIn: cardInfo.imageInBodyUrl,
          checkOutCardText: cardNumber,
          message,
        })
      );
      return;
    }

    const isNotEnoughMoney = cardInfo.amount > 0;
    if (isNotEnoughMoney) {
      message = IS_NOT_ENOUGH_TO_PAY;
    }
    // Check if there's any actual change in state before dispatching
    dispatch(
      setNewCardInfo({
        ...checkOutInfo,
        id: cardInfo.id,
        checkOutCardText: cardNumber,
        cashToPay: cardInfo.amount,
        plateImgIn: cardInfo.imageInUrl,
        timeIn: new Date(cardInfo.timeIn).toString(),
        plateTextIn: cardInfo.plateNumber,
        customerType: APP_CUSTOMER,
        plateTextOut: checkOutInfo.plateTextOut,
        isError: !isPlateMatched || isNotEnoughMoney,
        bodyImgIn: cardInfo.imageInBodyUrl,
        message,
      })
    );
  }, [
    cardData?.data?.data,
    checkOutInfo.id,
    checkOutInfo.plateImgOut,
    watch("CardNumber"),
  ]);

  const handleCheckOutMissingCard = async () => {
    try {
      //* handle spam checkout missing card
      if (isRunningAPI.current) {
        return;
      }
      notAllowCheckOut();
      const plateNumber = unFormatPlateNumber(
        watch("PlateNumber")?.toUpperCase() as string
      );

      const isValidPlate = isValidPlateNumber(plateNumber);
      if (!isValidPlate) {
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
          triggerGetInfoByPlateNumber.current = false;
          reset({ PlateNumber: "" });
          //* allow api to run again
          allowCheckOut();
          dispatch(
            setNewCardInfo({
              ...initCheckOutInfo,
              message: NEXT_CUSTOMER,
              isError: false,
            })
          );
        },
      });
    } catch (err: unknown) {
      allowCheckOut();
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
  console.log(isRunningAPI.current);

  const onCheckOut = async (checkOutData: CheckOut) => {
    try {
      //* handle spamming check out
      if (isRunningAPI.current === true) {
        return;
      }
      notAllowCheckOut();
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
          triggerInfoByCard.current = false;
          allowCheckOut();
          reset({ CardNumber: "", PlateNumber: "" });
          dispatch(
            setNewCardInfo({
              ...initCheckOutInfo,
              message: NEXT_CUSTOMER,
              isError: false,
            })
          );
        },
        onError: (err: unknown) => {
          allowCheckOut();
          const error = err as AxiosError<ErrorResponseAPI>;
          // reset();
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
          if (message === PLATE_IN_OTHER_SESSION_ERROR) {
            notAllowCheckOut();
            dispatch(
              setNewCardInfo({
                ...checkOutInfo,
                message: VEHICLE_IN_OTHER_SESSION,
                isError: true,
              })
            );
            return;
          }

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
          isError={checkOutInfo.isError}
          position={props.position}
          onMissingCardCheckOut={handleCheckOutMissingCard}
          onTriggerGetInfoByPlate={handleTriggerGetInfoByPlate}
          onReset={handleResetForm}
          refetchCardInfo={refetchCardInfo}
        />
      </HotkeysProvider>
    </ParkingContainer>
  );
}

export default CheckoutSection;
