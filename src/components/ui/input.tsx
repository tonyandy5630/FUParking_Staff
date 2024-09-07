import * as React from "react";
import { cn } from "@utils/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  endAdornment?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, endAdornment, ...props }, ref) => {
    return (
      <div className='relative flex items-center'>
        <input
          type={type}
          className={cn(
            "flex w-full h-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none  disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
          autoFocus={props.autoFocus}
        />
        {endAdornment && (
          <span className='absolute pl-3 text-md right-3'>{endAdornment}</span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
