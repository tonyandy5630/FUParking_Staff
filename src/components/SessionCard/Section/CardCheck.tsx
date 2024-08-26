import RectangleContainer from "@components/Rectangle";
import React, { useRef } from "react";
import CardInfoRow from "../CardInfo";
import Image from "@components/Image";
import { useHotkeys } from "react-hotkeys-hook";
import { FOCUS_CARD_INPUT_KEY } from "../../../hotkeys/key";
import PAGE from "../../../../url";

export default function CardCheckSection() {
  const cardNumberRef = useRef<HTMLInputElement>(null);
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
        <CardInfoRow label='Số thẻ'></CardInfoRow>
        <CardInfoRow label='Biển số xe'></CardInfoRow>
        <CardInfoRow label='Trạng thái thẻ'></CardInfoRow>
        <CardInfoRow>
          <hr />
        </CardInfoRow>
        <CardInfoRow label='Session ID'></CardInfoRow>
        <CardInfoRow label='Loại xe'></CardInfoRow>
        <CardInfoRow label='Giờ xe vào'></CardInfoRow>
        <CardInfoRow label='Cổng xe vào'></CardInfoRow>
      </RectangleContainer>
      <RectangleContainer className='h-full grid-cols-2 justify-items-stretch'>
        <Image src={""} isLoading={false} />
        <Image src={""} isLoading={false} />
      </RectangleContainer>
    </div>
  );
}
