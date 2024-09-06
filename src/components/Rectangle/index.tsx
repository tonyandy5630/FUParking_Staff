import { Skeleton } from "@components/ui/skeleton";
import React, { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  className?: string;
}

export default function RectangleContainer({ children, className }: Props) {
  return <div className={` grid ${className} gap-2 h-32`}>{children}</div>;
}

interface RectangleProps extends Props {
  title: React.ReactNode;
  isLoading?: boolean;
  contentClassName?: string;
}

export function Rectangle({
  className,
  title,
  isLoading = true,
  children,
  contentClassName,
}: RectangleProps) {
  return (
    <div
      className={`grid ${
        className ?? ""
      } py-2 items-center justify-center col-span-1 grid-rows-[auto_1fr] border rounded-md`}
    >
      <div className='flex items-center text-sm text-center'>{title}</div>
      {isLoading && <Skeleton className='min-w-full h-9' />}
      {
        <div
          className={` ${contentClassName} max-h-fit text-xl font-bold text-center `}
        >
          {!isLoading && children}
        </div>
      }
    </div>
  );
}
