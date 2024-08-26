import React, { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  label?: string;
}

export default function CardInfoRow({ children, label }: Props) {
  return (
    <div
      className={` grid min-w-full items-center ${
        label ? " grid-cols-2" : "grid-col-1 px-5"
      } gap-10`}
    >
      {label && <p className='font-bold justify-self-end'>{label}</p>}
      <p>{children ?? "Không có dữ liệu"}</p>
    </div>
  );
}
