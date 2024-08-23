import React from "react";
import ConnectForm from "./ConnectForm";
import { Controller, UseFormReturn } from "react-hook-form";
import { Input } from "@components/ui/input";
import { FormControl, FormItem, FormMessage } from "@components/ui/form";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
}

function FormInput({ name, type, className, ...props }: Props) {
  return (
    <ConnectForm>
      {({ control, formState: { errors } }: UseFormReturn) => (
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const { ...rest } = field;
            return (
              <FormItem>
                <FormControl>
                  <Input
                    className={`${className} p-1.5 pl-3 pr-3 w-full border rounded-sm min-h-full ${
                      errors[name]?.message !== undefined &&
                      "border-destructive"
                    }`}
                    type={type}
                    key={name}
                    defaultValue={""}
                    autoFocus={props.autoFocus}
                    placeholder={props.placeholder}
                    disabled={props.disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    {...rest}
                    // onChange={props.onChange}
                  />
                </FormControl>
                <FormMessage>
                  {errors[name]?.message !== undefined && (
                    <p className='p-0 mt-1 ml-1 text-xs text-destructive'>
                      {errors[name]?.message?.toString() ?? "error"}
                    </p>
                  )}
                </FormMessage>
              </FormItem>
            );
          }}
        />
      )}
    </ConnectForm>
  );
}

export default FormInput;
