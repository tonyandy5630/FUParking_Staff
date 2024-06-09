import React from "react";

type Props = {
  children: any;
};
export default function Container({ children }: Props) {
  return (
    <div className='flex flex-col items-center justify-center w-full h-full min-h-full'>
      <main className='flex flex-col items-center justify-between h-full min-w-full'>
        {children}
      </main>
    </div>
  );
}
