import React, { PropsWithChildren } from "react";

export default function ParkingContainer({ children }: PropsWithChildren) {
  return (
    <div className='grid w-full h-full max-w-screen-md col-span-1 p-1 border border-gray-500 border-solid justify-items-stretch'>
      {children}
    </div>
  );
}
