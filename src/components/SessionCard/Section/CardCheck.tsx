import RectangleContainer from "@components/Rectangle";
import React, { useEffect, useRef, useState } from "react";
import CardInfoRow from "../CardInfo";
import Image from "@components/Image";
import { useHotkeys } from "react-hotkeys-hook";
import { CANCELED_HOTKEY, FOCUS_CARD_INPUT_KEY } from "../../../hotkeys/key";
import PAGE from "../../../../url";
import { Separator } from "@components/ui/separator";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@utils/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SessionCard } from "@my_types/session-card";
import {
  initSessionCard,
  setNewSessionInfo,
} from "../../../redux/sessionSlice";
import toLocaleDate from "@utils/date";
import { formatPlateNumber } from "@utils/plate-number";
import {
  CLOSED_SESSION_STATUS,
  MISSING_CARD_STATUS,
  PARKED_SESSION_STATUS,
} from "@constants/session.const";
import { CARD_NOT_INFO, PARKING_SESSION } from "@constants/message.const";
import {
  getCardSessionInfoAPI,
  updateSessionPlateNumberAPI,
} from "@apis/session.api";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { updateSessionPlateNumberSchema } from "@utils/schema/sessionSchema";

export default function CardCheckSection() {
  const cardInfo = useSelector((state: RootState) => state.session);
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const [cardValue, setCardValue] = useState<string>("");
  const [showPlateInput, setShowPlateInput] = useState(false);
  const dispatch = useDispatch();

  const {
    data: cardData,
    isLoading: isLoadingCard,
    isError: isErrorCard,
  } = useQuery({
    queryKey: ["/get-card-session-by-number", cardValue],
    queryFn: () => getCardSessionInfoAPI(cardValue),
    enabled: cardValue.length === 10,
  });

  const methods = useForm({
    resolver: yupResolver(updateSessionPlateNumberSchema),
    defaultValues: {
      SessionId: cardInfo.sessionId,
      PlateNumber: cardInfo.plateNumber,
    },
  });
  const {
    getValues,
    setValue,
    reset,
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;
  useHotkeys(
    FOCUS_CARD_INPUT_KEY,
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
    CANCELED_HOTKEY,
    () => {
      setShowPlateInput(false);
      reset();
    },
    {
      scopes: [PAGE.CARD_CHECKER],
      enableOnFormTags: ["INPUT"],
    }
  );

  useEffect(() => {
    const cardInfoData = cardData?.data.data;
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
    } = cardInfoData;

    if (cardNumberRef.current) cardNumberRef.current.value = "";
    if (sessionId === null) return;
    if (sessionStatus === CLOSED_SESSION_STATUS) {
      dispatch(
        setNewSessionInfo({ ...initSessionCard, cardStatus: "Thẻ trống" })
      );
      return;
    }

    if (status === MISSING_CARD_STATUS) {
      dispatch(
        setNewSessionInfo({ ...initSessionCard, cardStatus: "Thẻ đã bị mất" })
      );
      return;
    }

    const newCardInfo: SessionCard = {
      gateIn: sessionGateIn,
      imageInBodyUrl: imageInBodyUrl,
      imageInUrl,
      timeIn: toLocaleDate(new Date(sessionTimeIn)),
      vehicleType: sessionVehicleType,
      plateNumber: sessionPlateNumber,
      sessionId: sessionId,
      cardNumber: cardValue,
      cardStatus:
        sessionStatus === PARKED_SESSION_STATUS
          ? PARKING_SESSION
          : CARD_NOT_INFO,
      isClosed: sessionStatus !== PARKED_SESSION_STATUS && cardInfo.isClosed,
    };

    dispatch(setNewSessionInfo(newCardInfo));
  }, [cardData?.data.data]);

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardValue(e.target.value);
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
          <CardInfoRow isLoading={isLoadingCard} label='Biển số xe'>
            {formatPlateNumber(cardInfo.plateNumber)}
          </CardInfoRow>
        </FormProvider>

        <CardInfoRow isLoading={isLoadingCard} label='Trạng thái'>
          {cardInfo.cardStatus}
        </CardInfoRow>
        <div className='flex items-center px-4'>
          <Separator />
        </div>
        <CardInfoRow isLoading={isLoadingCard} label='Loại xe'>
          {cardInfo.vehicleType}
        </CardInfoRow>
        <CardInfoRow isLoading={isLoadingCard} label='Giờ xe vào'>
          {cardInfo.timeIn}
        </CardInfoRow>
        <CardInfoRow isLoading={isLoadingCard} label='Cổng xe vào'>
          {cardInfo.gateIn}
        </CardInfoRow>
      </RectangleContainer>
      <RectangleContainer className='h-full grid-cols-2 justify-items-stretch min-h-[190px]'>
        <Image
          isLoading={isLoadingCard}
          className='object-scale-down'
          src={cardInfo.imageInUrl}
        />
        <Image
          isLoading={isLoadingCard}
          className='object-scale-down'
          src={cardInfo.imageInBodyUrl}
        />
      </RectangleContainer>
    </div>
  );
}
