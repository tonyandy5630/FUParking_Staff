import { Button } from "@components/ui/button";
import React, {
  ButtonHTMLAttributes,
  MouseEventHandler,
  useState,
} from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
  currentValue?: string;
  onToggleClick: (value: string) => void;
}
export default function ToggleButton({
  value,
  currentValue = "",
  onToggleClick,
  ...props
}: Props) {
  const handleClick = (e: any) => {
    onToggleClick(value);
  };

  return (
    <Button
      className='w-32 rounded-sm'
      variant={`${
        currentValue.trim() === value.trim() ? "default" : "outline"
      }`}
      value={value}
      onClick={handleClick}
      {...props}
    >
      {props.children}
    </Button>
  );
}
