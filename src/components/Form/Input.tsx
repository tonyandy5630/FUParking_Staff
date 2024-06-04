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
};

export default function FormInput({
  name,
  type = "text",
  autofocus = false,
  placeholder,
  className,
}: Props) {
  const [value, setValue] = React.useState<string>();
  return (
    <ConnectForm>
      {({ register }: UseFormReturn) => (
        <>
          <Input
            {...register(name)}
            className={`${className} p-1.5 pl-3 pr-3 w-full border rounded-sm h-7`}
            type={type}
            id={name}
            name={name}
            autoFocus={autofocus}
            placeholder={placeholder}
            onChange={(e) => setValue(e.target.value)}
          />
        </>
      )}
    </ConnectForm>
  );
}
