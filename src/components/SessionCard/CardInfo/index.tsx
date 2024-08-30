import { Skeleton } from "@components/ui/skeleton";
import { EMPTY_INFO_CARD } from "@constants/error-message.const";
import { CARD_NOT_INFO } from "@constants/message.const";
import React, { PropsWithChildren, useMemo } from "react";

interface Props extends PropsWithChildren {
  label?: string;
  content?: React.ReactNode;
  isLoading?: boolean;
}

export default function CardInfoRow({
  children,
  label,
  content,
  isLoading,
}: Props) {
  const show = useMemo(() => {
    if (isLoading) return <Skeleton className='w-full h-4' />;
    return children === undefined || children === "" ? (
      <p className='text-base'>{children}</p>
    ) : (
      children
    );
  }, [isLoading, children]);
  return (
    <div
      className={` grid p-2 min-w-full items-center ${
        label ? " grid-cols-2" : "grid-col-1 px-5"
      } gap-10`}
    >
      {label && <p className='font-bold justify-self-end'>{label}</p>}
      {show}
    </div>
  );
}
