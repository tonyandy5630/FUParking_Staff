import React from "react";

type Props = {
  children?: any;
  className?: string;
};

export default function FormColumn({ children, className }: Props) {
  return (
    <div
      className={`flex flex-col items-center p-3 w-[50%] min-h-full h-full justify-evenly gap-y-3 ${className}`}
    >
      {children}
    </div>
  );
}
