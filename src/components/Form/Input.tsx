import React from "react";
import ConnectForm from "./ConnectForm";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@components/ui/input";

type Props = {
  name: string;
  type?: "password" | "text";
  placeholder: string;
  autofocus?: boolean;
  className?: string;
  error?: string;
};

export default function FormInput({
  name,
  type = "text",
  autofocus = false,
  placeholder,
  className,
  error,
}: Props) {
  const [value, setValue] = React.useState<string>();
  return (
    <ConnectForm>
      {({ register }: UseFormReturn) => (
        <div>
          <Input
            {...register(name)}
            className={`${className} p-1.5 pl-3 pr-3 w-full border rounded-sm h-7 ${
              error !== undefined && "border-destructive"
            }`}
            type={type}
            id={name}
            name={name}
            autoFocus={autofocus}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
          />
          {error !== undefined && (
            <p className='p-0 mt-1 ml-1 text-xs text-destructive'>{error}</p>
          )}
        </div>
      )}
    </ConnectForm>
  );
}
