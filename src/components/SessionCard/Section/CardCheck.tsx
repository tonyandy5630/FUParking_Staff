import RectangleContainer from "@components/Rectangle";
import React, { lazy, useEffect, useRef, useState } from "react";
import CardInfoRow from "../CardInfo";
import Image from "@components/Image";
import { useHotkeys } from "react-hotkeys-hook";
import {
  CANCEL_LEFT_HOTKEY,
  FOCUS_CARD_INPUT_LEFT_KEY,
} from "../../../hotkeys/key";
import PAGE from "../../../../url";
import { Separator } from "@components/ui/separator";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@utils/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SessionCard } from "@my_types/session-card";
import {
  initSessionCard,
  setNewSessionInfo,
} from "../../../redux/sessionSlice";
import toLocaleDate from "@utils/date";
import { formatPlateNumber } from "@utils/plate-number";
import {
  ACTIVE_CARD_STATUS,
  CLOSED_SESSION_STATUS,
  DEACTIVE_CARD_STATUS,
  MISSING_CARD_STATUS,
  PARKED_SESSION_STATUS,
} from "@constants/session.const";
import {
  ACTIVE_CARD_MESSAGE,
  CARD_NOT_IN_SYSTEM,
  CARD_NOT_INFO,
  CLOSED_SESSION_MESSAGE,
  DEACTIVE_CARD_MESSAGE,
  ERROR_MESSAGE,
  MISSING_CARD_MESSAGE,
  PARKED_SESSION_MESSAGE,
  PARKING_SESSION,
} from "@constants/message.const";
import { getCardSessionInfoAPI } from "@apis/session.api";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { updateSessionPlateNumberSchema } from "@utils/schema/sessionSchema";
import { AxiosError, HttpStatusCode } from "axios";
import { ErrorResponseAPI } from "@my_types/index";
import { Button } from "@components/ui/button";
import { CopyIcon } from "@radix-ui/react-icons";
import { reactivateCardAPI } from "@apis/card.api";
const CustomTooltip = lazy(() => import("@components/Tooltip"));

export default function CardCheckSection() {
  const cardInfo = useAppSelector((state) => state.session);
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const [cardValue, setCardValue] = useState<string>("");
  const [showPlateInput, setShowPlateInput] = useState(false);
  const dispatch = useDispatch();

  const {
    data: cardData,
    isLoading: isLoadingCard,
    isError: isErrorCard,
    error,
  } = useQuery({
    queryKey: ["/get-card-session-by-number", cardValue],
    queryFn: () => getCardSessionInfoAPI(cardValue.trim()),
    enabled: cardValue.length === 10,
  });

  const {
    mutateAsync: mutateReactivateCardAsync,
    isPending: isReactivatingCard,
  } = useMutation({
    mutationKey: ["reactivate-card"],
    mutationFn: reactivateCardAPI,
  });

  const methods = useForm({
    resolver: yupResolver(updateSessionPlateNumberSchema),
    defaultValues: {
      SessionId: cardInfo.sessionId,
      PlateNumber: cardInfo.plateNumber,
    },
  });
  const {
    setValue,
    reset,
    formState: { errors },
  } = methods;
  useHotkeys(
    FOCUS_CARD_INPUT_LEFT_KEY.key,
    () => {
      if (cardNumberRef.current) {
        cardNumberRef.current.focus();
        cardNumberRef.current.value = "";
      }
    },
    {
      scopes: [PAGE.CARD_CHECKER],
    }
  );

  useHotkeys(
    CANCEL_LEFT_HOTKEY.key,
    () => {
      setShowPlateInput(false);
      reset();
    },
    {
      scopes: [PAGE.CARD_CHECKER],
      enableOnFormTags: ["INPUT"],
    }
  );
  const handleReactivateButtonClick = async () => {
    try {
      await mutateReactivateCardAsync(cardInfo.cardId, {
        onSuccess: (res) => {
          dispatch(
            setNewSessionInfo({
              ...initSessionCard,
              cardStatus: ACTIVE_CARD_MESSAGE,
            })
          );
        },
      });
    } catch (err) {
      dispatch(
        setNewSessionInfo({ ...initSessionCard, cardStatus: ERROR_MESSAGE })
      );
      console.log(err);
    }
  };

  useEffect(() => {
    dispatch(setNewSessionInfo(initSessionCard));
  }, []);

  useEffect(() => {
    const cardInfoData = cardData?.data.data;

    if (isErrorCard) {
      const axiosErr = error as AxiosError<ErrorResponseAPI>;
      const errorResponse = axiosErr.response;
      if (!errorResponse) {
        dispatch(
          setNewSessionInfo({ ...initSessionCard, cardStatus: "Lỗi hệ thống" })
        );
      }

      if (errorResponse?.status === HttpStatusCode.NotFound) {
        dispatch(
          setNewSessionInfo({
            ...initSessionCard,
            cardStatus: CARD_NOT_IN_SYSTEM,
          })
        );
      }
    }

    if (!cardInfoData) return;

    const {
      imageInBodyUrl,
      imageInUrl,
      status,
      sessionGateIn,
      sessionPlateNumber,
      sessionTimeIn,
      sessionVehicleType,
      sessionId,
      sessionStatus,
      timeOut,
      cardId,
    } = cardInfoData;

    if (cardNumberRef.current) cardNumberRef.current.value = "";
    if (sessionId === null) {
      dispatch(
        setNewSessionInfo({ ...initSessionCard, cardStatus: "Thẻ trống" })
      );
      return;
    }

    //* handle closed session status with active card
    if (
      (status !== MISSING_CARD_STATUS &&
        sessionStatus === CLOSED_SESSION_STATUS) ||
      sessionStatus === null
    ) {
      dispatch(
        setNewSessionInfo({
          ...initSessionCard,
          sessionStatus: "",
          cardStatus: "Thẻ trống",
        })
      );
      return;
    }

    //* handle session message + card status message with missing card
    let sessionInfoStatus = PARKED_SESSION_MESSAGE;
    let cardStatus = ACTIVE_CARD_MESSAGE;

    if (status === MISSING_CARD_STATUS) {
      cardStatus = MISSING_CARD_MESSAGE;
      //* show closed session status when card is missing
      if (sessionStatus === CLOSED_SESSION_STATUS) {
        sessionInfoStatus = CLOSED_SESSION_MESSAGE;
      }
    } else if (status === DEACTIVE_CARD_STATUS) {
      //* not show info if card is not activated
      cardStatus = DEACTIVE_CARD_MESSAGE;
      dispatch(setNewSessionInfo({ ...initSessionCard, cardStatus }));
      return;
    }

    const newCardInfo: SessionCard = {
      gateIn: sessionGateIn,
      imageInBodyUrl: imageInBodyUrl,
      timeOut,
      imageInUrl,
      timeIn: toLocaleDate(sessionTimeIn),
      vehicleType: sessionVehicleType,
      plateNumber: sessionPlateNumber,
      sessionId: sessionId,
      cardNumber: cardValue,
      cardStatus,
      sessionStatus: sessionInfoStatus,
      isClosed: sessionStatus !== PARKED_SESSION_STATUS && cardInfo.isClosed,
      cardId,
    };

    if (status === MISSING_CARD_STATUS) {
      dispatch(setNewSessionInfo(newCardInfo));
      return;
    }

    dispatch(setNewSessionInfo(newCardInfo));
  }, [cardData?.data.data, isErrorCard]);

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardValue(e.target.value.trim());
  };

  useEffect(() => {
    setShowPlateInput(false);
    setValue("SessionId", cardInfo.sessionId);
  }, [cardInfo]);

  useEffect(() => {
    if (showPlateInput) {
      setValue("PlateNumber", cardInfo.plateNumber);
    }
  }, [showPlateInput]);
  const isLoading = isLoadingCard || isReactivatingCard;
  return (
    <div className='grid col-span-1 gap-3 grid-rows-[auto_2fr_auto] '>
      <RectangleContainer>
        <div className='grid items-center justify-center min-w-full text-4xl font-bold uppercase'>
          <h4>thông tin</h4>
        </div>
        <form
          className='absolute right-0 border opacity-0 top-20'
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            autoFocus={true}
            onChange={handleCardChange}
            ref={cardNumberRef}
          />
        </form>
      </RectangleContainer>
      <RectangleContainer className='min-h-full border rounded-md grid-rows-7'>
        <FormProvider {...methods}>
          <CardInfoRow isLoading={isLoading} label='Biển số xe'>
            {cardInfo.plateNumber !== "" && (
              <div className='flex items-center gap-1'>
                <span>{formatPlateNumber(cardInfo.plateNumber)}</span>
                <CustomTooltip tooltip='Copy'>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() =>
                      navigator.clipboard.writeText(cardInfo.plateNumber)
                    }
                  >
                    <CopyIcon />
                  </Button>
                </CustomTooltip>
              </div>
            )}
          </CardInfoRow>
        </FormProvider>
        <CardInfoRow isLoading={isLoading} label='Trạng thái thẻ'>
          <div
            className={`flex items-center justify-start w-full gap-2 ${
              cardInfo.cardStatus === ERROR_MESSAGE
                ? "text-red-500 font-bold"
                : ""
            }`}
          >
            {cardInfo.cardStatus}
            {cardInfo.cardStatus === MISSING_CARD_MESSAGE && (
              <Button
                variant='outline'
                className='h-10 p-1 text-xs'
                onClick={handleReactivateButtonClick}
              >
                Kích hoạt thẻ
              </Button>
            )}
          </div>
        </CardInfoRow>
        <CardInfoRow isLoading={isLoading} label='Trạng thái phiên'>
          {cardInfo.sessionStatus}
        </CardInfoRow>
        <div className='flex items-center px-4'>
          <Separator />
        </div>
        <CardInfoRow isLoading={isLoading} label='Loại xe'>
          {cardInfo.vehicleType}
        </CardInfoRow>
        <CardInfoRow isLoading={isLoading} label='Giờ xe vào'>
          {cardInfo.timeIn}
        </CardInfoRow>
        <CardInfoRow isLoading={isLoading} label='Giờ xe ra'>
          {cardInfo.timeOut}
        </CardInfoRow>
        <CardInfoRow isLoading={isLoading} label='Cổng xe vào'>
          {cardInfo.gateIn}
        </CardInfoRow>
      </RectangleContainer>
      <RectangleContainer className='h-full grid-cols-2 justify-items-stretch min-h-[190px]'>
        <Image
          isLoading={isLoading}
          className='object-scale-down'
          src={cardInfo.imageInUrl}
        />
        <Image
          isLoading={isLoading}
          className='object-scale-down'
          src={cardInfo.imageInBodyUrl}
        />
      </RectangleContainer>
    </div>
  );
}
