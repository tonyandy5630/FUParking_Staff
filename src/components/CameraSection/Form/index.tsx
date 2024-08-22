import { FormHTMLAttributes, HTMLAttributes, PropsWithChildren } from "react";
import { StringSchema } from "yup";

interface FormContainerProps
  extends Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  onSubmit: any;
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

interface FormInfoRowProps extends PropsWithChildren {}

export function FormInfoRow({ children }: FormInfoRowProps) {
  return <div className='grid grid-cols-2 row-span-4 gap-2'>{children}</div>;
}

interface FormNameRowProps extends HTMLAttributes<HTMLDivElement> {
  error?: boolean;
  message?: string;
}

export function FormNameRow({
  children,
  error,
  message,
  onClick,
}: FormNameRowProps) {
  return (
    <div
      className='grid w-full grid-cols-2 row-span-1 border border-gray-300 border-solid h-fit'
      onClick={onClick}
    >
      <div className='flex items-center justify-center p-2 text-base text-white uppercase w-fit bg-primary'>
        {children}
      </div>
      <div
        className={`grid col-span-1 items-center uppercase text-lg font-bold ${
          error ? "text-red-500" : "text-green-500"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
