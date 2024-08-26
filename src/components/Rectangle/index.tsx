import { Skeleton } from "@components/ui/skeleton";
import React, { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  className?: string;
}

export default function RectangleContainer({ children, className }: Props) {
  return <div className={` grid ${className} gap-3 h-32`}>{children}</div>;
}

interface RectangleProps extends Props {
  title: string;
  isLoading?: boolean;
}

export function Rectangle({
  className,
  title,
  isLoading = true,
  children,
}: RectangleProps) {
  return (
    <div className='grid items-center justify-center col-span-1 grid-rows-2 border rounded-md'>
      <h5>{title}</h5>
      {isLoading && <Skeleton className='min-w-full h-9' />}
      {
        <p className='text-2xl font-bold text-center'>
          {!isLoading && children}
        </p>
      }
    </div>
  );
}
