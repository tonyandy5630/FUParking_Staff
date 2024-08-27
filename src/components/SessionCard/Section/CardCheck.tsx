import RectangleContainer from "@components/Rectangle";
import React, { useEffect, useMemo, useRef, useState } from "react";
import CardInfoRow from "../CardInfo";
import Image from "@components/Image";
import { useHotkeys } from "react-hotkeys-hook";
import { FOCUS_CARD_INPUT_KEY } from "../../../hotkeys/key";
import PAGE from "../../../../url";
import { Separator } from "@components/ui/separator";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@utils/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SessionCard } from "@my_types/session-card";
import { setNewSessionInfo } from "../../../redux/sessionSlice";
import toLocaleDate from "@utils/date";
import { formatPlateNumber } from "@utils/plate-number";
import {
  CLOSED_SESSION_STATUS,
  PARKED_SESSION_STATUS,
} from "@constants/session.const";
import { CARD_NOT_INFO } from "@constants/message.const";
import { Button } from "@components/ui/button";
import FormInput from "@components/Form/Input";
import {
  getCardSessionInfoAPI,
  updateSessionPlateNumberAPI,
} from "@apis/session.api";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  updateSessionPlateNumberSchema,
  updateSessionPlateNumberSchemaType,
} from "@utils/schema/sessionSchema";
import wrapText from "@utils/text";

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

  const handleTogglePlateInput = () => {
    setShowPlateInput((prev) => !prev);
  };

  const methods = useForm({
    resolver: yupResolver(updateSessionPlateNumberSchema),
    defaultValues: {
      SessionId: cardInfo.sessionId,
    },
  });
  const { getValues, setValue, reset } = methods;
  useHotkeys(
    FOCUS_CARD_INPUT_KEY,
    () => {
      if (cardNumberRef.current) {
        cardNumberRef.current.value = "";
        cardNumberRef.current.focus();
      }
    },
    {
      scopes: [PAGE.CARD_CHECKER],
    }
  );

  const {
    mutateAsync: mutateUpdateSessionPlateNumber,
    isPending: isPendingUpdate,
  } = useMutation({
    mutationKey: ["/update-session-plate-number"],
    mutationFn: updateSessionPlateNumberAPI,
  });

  const handleUpdateSessionPlate = async (
    data: updateSessionPlateNumberSchemaType
  ) => {
    try {
      const updateBody = new FormData();
      updateBody.append("PlateNumber", getValues("PlateNumber"));
      updateBody.append("SessionId", cardInfo.sessionId);

      await mutateUpdateSessionPlateNumber(updateBody as any, {
        onSuccess: () => {
          setShowPlateInput(false);
          dispatch(
            setNewSessionInfo({
              ...cardInfo,
              plateNumber: getValues("PlateNumber"),
            })
          );
        },
      });
    } catch (err: unknown) {}
  };

  useEffect(() => {
    const cardInfoData = cardData?.data.data;
    if (!cardInfoData) return;

    const {
      cardNumber,
      imageInBodyUrl,
      imageInUrl,
      status,
      sessionGateIn,
      sessionPlateNumber,
      sessionTimeIn,
      sessionVehicleType,
      sessionId,
    } = cardInfoData;
    if (cardNumberRef.current) cardNumberRef.current.value = "";
    // if (status === CLOSED_SESSION_STATUS) return;

    const newCardInfo: SessionCard = {
      gateIn: sessionGateIn,
      imageInBodyUrl: imageInBodyUrl,
      imageInUrl,
      timeIn: toLocaleDate(new Date(sessionTimeIn)),
      vehicleType: sessionVehicleType,
      plateNumber: formatPlateNumber(sessionPlateNumber),
      sessionId: sessionId,
      cardNumber: cardValue,
      cardStatus:
        status === PARKED_SESSION_STATUS ? "Đang giữ xe" : CARD_NOT_INFO,
      isClosed: status === CLOSED_SESSION_STATUS || cardInfo.isClosed,
    };

    dispatch(setNewSessionInfo(newCardInfo));
  }, [cardData?.data.data]);

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardValue(e.target.value);
  };

  useEffect(() => {
    setShowPlateInput(false);
  }, [cardInfo]);

  const plateNumberRow = useMemo(() => {
    if (cardInfo.plateNumber === "") return "";

    if (!showPlateInput) {
      return;
    }
  }, []);

  useEffect(() => {
    if (showPlateInput) setValue("PlateNumber", cardInfo.plateNumber);
  }, [showPlateInput]);
  return (
    <div className='grid col-span-1 gap-3 grid-rows-[auto_2fr_auto] '>
      <RectangleContainer>
        <div className='grid items-center justify-center min-w-full text-4xl font-bold uppercase'>
          <h4>Tra cứu thẻ</h4>
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
            {cardInfo.plateNumber !== "" ? (
              <form className='grid grid-cols-[auto_1fr] gap-2 items-center w-full'>
                {showPlateInput ? (
                  <FormInput
                    autoFocus={true}
                    className='border w-22'
                    defaultValue={cardInfo.plateNumber}
                    name='plateNumber'
                  />
                ) : (
                  <p>{cardInfo.plateNumber}</p>
                )}
                {!cardInfo.isClosed && (
                  <div>
                    <Button
                      className='!min-w-4 text-primary h-8'
                      type='button'
                      variant='ghost'
                      onClick={() => handleTogglePlateInput()}
                    >
                      {showPlateInput ? "Hủy" : "Sửa"}
                    </Button>
                  </div>
                )}
              </form>
            ) : (
              cardInfo.plateNumber
            )}
          </CardInfoRow>
        </FormProvider>

        <CardInfoRow isLoading={isLoadingCard} label='Trạng thái thẻ'>
          {cardInfo.cardStatus}
        </CardInfoRow>
        <div className='flex items-center px-4'>
          <Separator />
        </div>
        <CardInfoRow isLoading={isLoadingCard} label='Session ID'>
          {wrapText(cardInfo.sessionId, 20)}
        </CardInfoRow>
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
          src={cardInfo.imageInBodyUrl}
        />
        <Image
          isLoading={isLoadingCard}
          className='object-scale-down'
          src={cardInfo.imageInUrl}
        />
      </RectangleContainer>
    </div>
  );
}
