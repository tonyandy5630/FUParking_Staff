import React from "react";

type Props = {
  children?: any;
  className?: string;
};

function FormItem({ children, className }: Props) {
  return (
    <div
      className={`grid items-center px-2 col-span-2 justify-stretch ${className}`}
    >
      {children}
    </div>
  );
}

export default React.memo(FormItem);
