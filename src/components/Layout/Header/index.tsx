import React from "react";

const LOGO_WIDTH = 40;

export default function Header() {
  return (
    <div className='flex items-center justify-start min-w-full p-2 bg-primary-text'>
      <div className='flex items-center justify-between'>
        <img src='./Bai_Logo.png' width={LOGO_WIDTH} height={LOGO_WIDTH} />
        <p className='font-bold text-white uppercase text-md'>
          PARKING MANAGEMENT SYSTEM
        </p>
      </div>
    </div>
  );
}
