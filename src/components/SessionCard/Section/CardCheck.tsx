import RectangleContainer from "@components/Rectangle";
import React, { useRef } from "react";
import CardInfoRow from "../CardInfo";
import Image from "@components/Image";
import { useHotkeys } from "react-hotkeys-hook";
import { FOCUS_CARD_INPUT_KEY } from "../../../hotkeys/key";
import PAGE from "../../../../url";
import { Separator } from "@components/ui/separator";
import { useSelector } from "react-redux";
import { RootState } from "@utils/store";

export default function CardCheckSection() {
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const cardInfo = useSelector((state: RootState) => state.session);

  useHotkeys(
    FOCUS_CARD_INPUT_KEY,
    () => {
      if (cardNumberRef.current) cardNumberRef.current.focus();
    },
    { scopes: [PAGE.CARD_CHECKER] }
  );

  return (
    <div className='grid col-span-1 gap-3 grid-rows-[auto_2fr_auto] '>
      <RectangleContainer>
        <div className='grid items-center justify-center min-w-full text-4xl font-bold uppercase'>
          <h4>Tra cứu thẻ</h4>
        </div>
        <input
          className='absolute right-0 border opacity-0 top-20'
          ref={cardNumberRef}
        />
      </RectangleContainer>
      <RectangleContainer className='h-full border rounded-md grid-rows-8'>
        <CardInfoRow label='Số thẻ' content={cardInfo.cardNumber} />
        <CardInfoRow label='Biển số xe' content={cardInfo.plateNumber} />
        <CardInfoRow label='Trạng thái thẻ' content={cardInfo.cardStatus} />
        <div className='flex items-center px-4'>
          <Separator />
        </div>
        <CardInfoRow label='Session ID' content={cardInfo.sessionId} />
        <CardInfoRow label='Loại xe' content={cardInfo.vehicleType} />
        <CardInfoRow label='Giờ xe vào' content={cardInfo.timeIn} />
        <CardInfoRow label='Cổng xe vào' content={cardInfo.gateIn} />
      </RectangleContainer>
      <RectangleContainer className='h-full grid-cols-2 justify-items-stretch'>
        <Image src={""} isLoading={false} />
        <Image src={""} isLoading={false} />
      </RectangleContainer>
    </div>
  );
}
