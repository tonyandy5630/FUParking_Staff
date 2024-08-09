import React from "react";

const LOGO_WIDTH = 50;
const LOGO_HEIGHT = 50;

export default function Header() {
  return (
    <div className='flex items-center justify-start min-w-full p-2 min-h-4 bg-primary-text'>
      <div className='flex items-center justify-between'>
        <img src='./Bai_Logo.png' width={LOGO_WIDTH} height={LOGO_HEIGHT} />
        <p className='font-bold text-white uppercase text-md'>
          PARKING MANAGEMENT SYSTEM
        </p>
      </div>
    </div>
  );
}
