import { Button } from "@components/ui/button";
import { Table } from "@tanstack/react-table";
import React, { ButtonHTMLAttributes, PropsWithChildren } from "react";

interface Props<TData> extends ButtonHTMLAttributes<HTMLButtonElement> {
  table: Table<TData>;
}
export default function PaginateButton<TData>({
  table,
  children,
  ...props
}: Props<TData>) {
  return (
    <Button variant='ghost' className='hidden w-2 h-8 p-0 lg:flex' {...props}>
      {children}
    </Button>
  );
}
