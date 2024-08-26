import { EMPTY_INFO_CARD } from "@constants/error-message.const";
import { CARD_NOT_INFO } from "@constants/message.const";
import React, { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  label?: string;
  content?: string;
}

export default function CardInfoRow({
  children,
  label,
  content = CARD_NOT_INFO,
}: Props) {
  return (
    <div
      className={` grid min-w-full items-center ${
        label ? " grid-cols-2" : "grid-col-1 px-5"
      } gap-10`}
    >
      {label && <p className='font-bold justify-self-end'>{label}</p>}
      {content !== CARD_NOT_INFO || content !== undefined ? (
        <p className='text-base'>{content}</p>
      ) : (
        content
      )}
    </div>
  );
}
