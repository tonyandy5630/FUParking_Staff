import React, { useState } from "react";
import ConnectForm from "./ConnectForm";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@components/ui/input";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@components/ui/form";
import { Button } from "@components/ui/button";

const showPasswordIconClass = "w-4 h-4";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
}

function FormInput({ name, type, className, ...props }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const handleToggleShowPassword = (e: any) => {
    setShowPassword((prev) => !prev);
  };
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
                  <>
                    <Input
                      className={`${className} px-3 w-full border rounded-sm ${
                        errors[name]?.message !== undefined &&
                        "border-destructive"
                      }`}
                      type={
                        type === "password"
                          ? showPassword
                            ? "text"
                            : "password"
                          : type
                      }
                      key={name}
                      autoFocus={props.autoFocus}
                      placeholder={props.placeholder}
                      disabled={props.disabled}
                      {...field}
                      endAdornment={
                        type === "password" && (
                          <Button
                            variant='ghost'
                            size='icon'
                            className='rounded-full'
                            type='button'
                            onClick={handleToggleShowPassword}
                          >
                            {showPassword ? (
                              <EyeClosedIcon
                                className={showPasswordIconClass}
                              />
                            ) : (
                              <EyeOpenIcon className={showPasswordIconClass} />
                            )}
                          </Button>
                        )
                      }
                      // onChange={props.onChange}
                    />
                  </>
                </FormControl>
                <FormMessage className='text-[12px]' />
              </FormItem>
            );
          }}
        />
      )}
    </ConnectForm>
  );
}

export default FormInput;
