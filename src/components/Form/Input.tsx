import React from "react";
import ConnectForm from "./ConnectForm";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@components/ui/input";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
}

const FormInput = React.forwardRef<HTMLInputElement, Props>(
  //! pass ref to Input will break
  ({ className, type, name, ...props }, ref) => {
    const [value, setValue] = React.useState<string>();
    return (
      <ConnectForm>
        {({ register, formState: { errors } }: UseFormReturn) => (
          <div className='w-full'>
            <Input
              {...register(name)}
              className={`${className} p-1.5 pl-3 pr-3 w-full border rounded-sm min-h-full ${
                errors[name]?.message !== undefined && "border-destructive"
              }`}
              type={type}
              id={name}
              name={name}
              autoFocus={props.autoFocus}
              placeholder={props.placeholder}
              onChange={(e) => setValue(e.target.value)}
            />
            {errors[name]?.message !== undefined && (
              <p className='p-0 mt-1 ml-1 text-xs text-destructive'>
                {errors[name].message.toString()}
              </p>
            )}
          </div>
        )}
      </ConnectForm>
    );
  }
);

export default FormInput;
