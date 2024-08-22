import React from "react";
import ConnectForm from "./ConnectForm";
import { Controller, UseFormReturn } from "react-hook-form";
import { Input } from "@components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@components/ui/form";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
}

const FormInput = React.forwardRef<HTMLInputElement, Props>(
  ({ className, type, name, ...props }, ref) => {
    return (
      <ConnectForm>
        {({ control, formState: { errors } }: UseFormReturn) => (
          <FormField
            name={name}
            control={control}
            render={({ field }) => {
              const { value, ...rest } = field;
              return (
                <FormItem>
                  <FormControl>
                    <Input
                      className={`${className} p-1.5 pl-3 pr-3 w-full border rounded-sm min-h-full ${
                        errors[name]?.message !== undefined &&
                        "border-destructive"
                      }`}
                      defaultValue={props.defaultValue ?? ""}
                      type={type}
                      key={name}
                      autoFocus={props.autoFocus}
                      placeholder={props.placeholder}
                      disabled={props.disabled}
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
);

FormInput.displayName = "FormInput";

export default React.memo(FormInput);
