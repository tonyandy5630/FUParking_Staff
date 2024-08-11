import React from "react";
import logo from "../../../assets/Bai_Logo.png";

const LOGO_WIDTH = 40;

export default function Header() {
  return (
    <div className='flex items-center justify-start min-w-full p-2 bg-primary-text'>
      <div className='flex items-center justify-between'>
        <img src={logo} width={LOGO_WIDTH} height={LOGO_WIDTH} />
        <p className='font-bold text-white uppercase text-md'>
          PARKING MANAGEMENT SYSTEM
        </p>
      </div>
    </div>
  );
}
