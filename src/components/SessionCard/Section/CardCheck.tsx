import RectangleContainer from "@components/Rectangle";
import React, { useEffect, useRef, useState } from "react";
import CardInfoRow from "../CardInfo";
import Image from "@components/Image";
import { useHotkeys } from "react-hotkeys-hook";
import { FOCUS_CARD_INPUT_KEY } from "../../../hotkeys/key";
import PAGE from "../../../../url";
import { Separator } from "@components/ui/separator";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@utils/store";
import { useQuery } from "@tanstack/react-query";
import { GET_CARD_CHECK_OUT_API_URL } from "@apis/url/check-out";
import { getCardCheckOutAPI } from "@apis/check-out.api";
import { SessionCard } from "@my_types/session-card";
import { setNewSessionInfo } from "../../../redux/sessionSlice";
import toLocaleDate from "@utils/date";
import { formatPlateNumber } from "@utils/plate-number";

export default function CardCheckSection() {
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const [cardValue, setCardValue] = useState<string>("");
  const cardInfo = useSelector((state: RootState) => state.session);

  const dispatch = useDispatch();

  const {
    data: cardData,
    isLoading: isLoadingCard,
    isError: isErrorCard,
  } = useQuery({
    queryKey: ["/get-card-session-by-number", cardValue],
    queryFn: () => getCardCheckOutAPI(cardValue),
    enabled: cardValue.length === 10,
  });

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
      enableOnFormTags: ["input", "textarea", "select"],
    }
  );

  useEffect(() => {
    const cardInfo = cardData?.data.data;
    if (!cardInfo) return;

    const {
      gateIn,
      imageInBodyUrl,
      imageInUrl,
      plateNumber,
      timeIn,
      vehicleType,
    } = cardInfo;
    const newCardInfo: SessionCard = {
      gateIn,
      imageInBodyUrl: imageInBodyUrl,
      imageInUrl,
      timeIn: toLocaleDate(new Date(timeIn)),
      vehicleType,
      plateNumber: formatPlateNumber(plateNumber),
      sessionId: "",
      cardNumber: cardValue,
      cardStatus: "PARKED",
    };
    if (cardNumberRef.current) cardNumberRef.current.value = "";

    dispatch(setNewSessionInfo(newCardInfo));
  }, [cardData?.data.data]);

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardValue(e.target.value);
  };
  console.log(cardInfo);

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
      <RectangleContainer className='h-full border rounded-md grid-rows-7'>
        <CardInfoRow
          isLoading={isLoadingCard}
          label='Biển số xe'
          content={cardInfo.plateNumber}
        />
        <CardInfoRow
          isLoading={isLoadingCard}
          label='Trạng thái thẻ'
          content={cardInfo.cardStatus}
        />
        <div className='flex items-center px-4'>
          <Separator />
        </div>
        <CardInfoRow
          isLoading={isLoadingCard}
          label='Session ID'
          content={cardInfo.sessionId}
        />
        <CardInfoRow
          isLoading={isLoadingCard}
          label='Loại xe'
          content={cardInfo.vehicleType}
        />
        <CardInfoRow
          isLoading={isLoadingCard}
          label='Giờ xe vào'
          content={cardInfo.timeIn}
        />
        <CardInfoRow
          isLoading={isLoadingCard}
          label='Cổng xe vào'
          content={cardInfo.gateIn}
        />
      </RectangleContainer>
      <RectangleContainer className='h-full grid-cols-2 justify-items-stretch'>
        <Image isLoading={isLoadingCard} src={cardInfo.imageInBodyUrl} />
        <Image isLoading={isLoadingCard} src={cardInfo.imageInUrl} />
      </RectangleContainer>
    </div>
  );
}
