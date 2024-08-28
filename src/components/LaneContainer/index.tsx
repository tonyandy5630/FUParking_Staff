import React, { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  is2Lane: boolean;
}

export default function LaneContainer({ is2Lane, children }: Props) {
  return (
    <div
      className={`grid min-w-full ${
        is2Lane
          ? "grid-cols-2 justify-items-stretch"
          : "grid-cols-1 justify-items-center"
      } pt-1 space-x-1 `}
    >
      {children}
    </div>
  );
}
