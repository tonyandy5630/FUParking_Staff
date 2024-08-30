import { GATE_IN } from "@constants/gate.const";
import { GateType } from "@my_types/gate";
import { FormHTMLAttributes, HTMLAttributes, PropsWithChildren } from "react";

interface FormContainerProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  onSubmit?: any;
}

export default function FormContainer({
  children,
  onSubmit,
  onKeyDown,
  onClick,
}: FormContainerProps) {
  return (
    <form
      onClick={onClick}
      onSubmit={onSubmit}
      onKeyDown={onKeyDown}
      className='grid p-1 border border-gray-400 border-solid gap-y-1'
    >
      {children}
    </form>
  );
}

interface FormInfoRowProps extends PropsWithChildren {
  className?: string;
}

export function FormInfoRow({ children, className }: FormInfoRowProps) {
  return <div className={`grid ${className} row-span-4 gap-2`}>{children}</div>;
}

interface FormNameRowProps extends HTMLAttributes<HTMLDivElement> {
  error?: boolean;
  message?: string;
  isLoading?: boolean;
  label: string;
  gateType: GateType;
}

export function FormNameRow({
  children,
  error,
  message,
  isLoading,
  label,
  onClick,
  gateType,
}: FormNameRowProps) {
  return (
    <div
      className='grid w-full grid-cols-[100px_1fr] row-span-1 border border-gray-300 border-solid h-fit'
      onClick={onClick}
    >
      <div
        className={`grid items-center justify-center col-span-1 p-2 text-base text-white uppercase w-fit bg-primary ${
          gateType === GATE_IN ? "!bg-blue-500" : ""
        }`}
      >
        {label}
      </div>

      <div
        className={`grid col-span-1 items-center uppercase text-base text-center font-bold ${
          error ? "text-red-500" : "text-green-500"
        }`}
      >
        {isLoading ? "Đang xác thực" : message}
      </div>
      <div>{children}</div>
    </div>
  );
}
