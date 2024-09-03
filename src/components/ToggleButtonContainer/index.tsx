import { Label } from "@components/ui/label";
import { Skeleton } from "@components/ui/skeleton";
import React, { PropsWithChildren, useMemo } from "react";

interface Props extends PropsWithChildren {
  label?: string;
  isLoading?: boolean;
}

export default function ToggleButtonContainer({
  label = "",
  children,
  isLoading = true,
}: Props) {
  const renderChildren = useMemo(() => {
    if (isLoading) {
      return Array.from({ length: 4 }, (_, i) => {
        return <Skeleton key={i} className='w-32 h-9' />;
      });
    }
    return children;
  }, [isLoading, children]);

  return (
    <div className='min-h-16'>
      {label !== "" && <Label>{label}</Label>}
      <div className='grid grid-cols-4 gap-1'>{renderChildren}</div>
    </div>
  );
}
