import { Button } from "@components/ui/button";
import React from "react";
import { Loader2 } from "lucide-react";

type Props = {
  isLoading?: Boolean;
  children?: any;
};

export default function MyButton({ isLoading, children }: Props) {
  if (!isLoading) return <Button>{children}</Button>;
  return (
    <Button disabled>
      <Loader2 className='w-4 h-4 mr-2 animate-spin' /> Loading...
    </Button>
  );
}
