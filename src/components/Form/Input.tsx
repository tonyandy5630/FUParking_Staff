import React from "react";
import ConnectForm from "./ConnectForm";
import { Controller, UseFormReturn } from "react-hook-form";
import { Input } from "@components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@components/ui/form";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
}

function FormInput({ name, type, className, ...props }: Props) {
  return (
    <ConnectForm>
      {({ control, formState: { errors } }: UseFormReturn) => (
        <FormField
          name={name}
          control={control}
          render={({ field }) => {
            return (
              <FormItem>
                <FormControl>
                  <Input
                    className={`${className} p-1.5 px-3 w-full border rounded-sm ${
                      errors[name]?.message !== undefined &&
                      "border-destructive"
                    }`}
                    type={type}
                    key={name}
                    autoFocus={props.autoFocus}
                    placeholder={props.placeholder}
                    disabled={props.disabled}
                    {...field}
                    // onChange={props.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
      )}
    </ConnectForm>
  );
}

export default FormInput;
