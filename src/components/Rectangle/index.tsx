import React, { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  className?: string;
}

export default function RectangleContainer({ children, className }: Props) {
  return <div className={` grid ${className} gap-3 h-32`}>{children}</div>;
}

interface RectangleProps extends Props {
  title: string;
  content: string;
}

export function Rectangle({
  children,
  className,
  title,
  content,
}: RectangleProps) {
  return (
    <div className='grid items-center justify-center col-span-1 grid-rows-2 border rounded-md'>
      <h5>{title}</h5>
      <p className='text-2xl font-bold text-center'>{content}</p>
    </div>
  );
}
