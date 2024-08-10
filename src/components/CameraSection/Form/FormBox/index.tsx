import React from "react";

type Props = {
  children?: any;
  title?: string;
};
export default function FormBox({ children, title }: Props) {
  return (
    <div className='flex items-center justify-around w-full border border-black min-h-10 '>
      {title && <p className='font-bold'>{title}</p>}
      <p className='min-w-16'>{children}</p>
    </div>
  );
}
