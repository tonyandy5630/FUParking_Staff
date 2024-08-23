import React, {
  Children,
  HTMLAttributes,
  PropsWithChildren,
  useMemo,
} from "react";

interface InfoSectionProps extends HTMLAttributes<HTMLDivElement> {
  numberOfRow?: 2 | 3 | 5;
}

export default function InfoSection({
  className,
  children,
  numberOfRow,
}: InfoSectionProps) {
  return (
    <div
      className={`grid content-between col-span-1 ${
        numberOfRow === 3 || !numberOfRow
          ? "grid-rows-[repeat(3,35px)]"
          : numberOfRow === 2
          ? `grid-rows-[repeat(2,60px)]`
          : numberOfRow === 5
          ? `grid-rows-[repeat(5,45px)]`
          : ""
      } gap-1`}
    >
      {children}
    </div>
  );
}

interface InfoVehicleProps extends HTMLAttributes<HTMLDivElement> {
  infoValue?: string;
  label?: string;
}

export function InfoVehicle({
  children,
  className,
  infoValue = "",
  label,
}: InfoVehicleProps) {
  return (
    <div
      className={` ${className} grid items-center grid-cols-2 row-span-1 px-2 border border-solid justify-stretch border-grey-400`}
    >
      <span>{label}</span>
      <span className='font-bold'>{children}</span>
    </div>
  );
}
