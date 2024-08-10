import React from "react";

type Props = {
  children?: any;
  className?: string;
};

export default function FormItem({ children, className }: Props) {
  return (
    <div className={`grid items-center px-2 justify-stretch ${className}`}>
      {children}
    </div>
  );
}
