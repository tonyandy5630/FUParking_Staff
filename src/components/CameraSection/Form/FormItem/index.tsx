import React from "react";

type Props = {
  children?: any;
  className?: string;
};

function FormItem({ children, className }: Props) {
  return (
    <div
      className={`grid grid-rows-2 row-span-1 p-1 border border-gray-400 border-solid ${className}`}
    >
      {children}
    </div>
  );
}

export default React.memo(FormItem);
