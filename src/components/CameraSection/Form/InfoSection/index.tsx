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
      className={`grid content-between ${className} col-span-1 ${
        numberOfRow === 3 || !numberOfRow
          ? "grid-rows-[repeat(3,35px)]"
          : numberOfRow === 2
          ? `grid-rows-[repeat(2,70px)]`
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
  col?: boolean;
}

export function InfoVehicle({
  children,
  className,
  infoValue = "",
  label,
  col,
}: InfoVehicleProps) {
  return (
    <div
      className={`grid items-center ${className} ${
        !col
          ? " grid-cols-2 row-span-1 justify-stretch"
          : "grid-flow-col grid-rows-2"
      } px-2 border border-solid  border-grey-400`}
    >
      <div className='grid col-span-1 w-fit'>{label}</div>
      <div className='font-bold text-center'>{children}</div>
    </div>
  );
}
