import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@utils/utils";
import * as React from "react";

const frameVariants = cva("border border-solid border-black aspect-video", {
  variants: {
    size: {
      md: "w-camera-md",
      sm: "w-camera-sm",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface FrameProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof frameVariants> {}

export default function Frame({
  children,
  className,
  size = "md",
}: FrameProps) {
  return (
    <div className={cn(frameVariants({ size, className }))}>{children}</div>
  );
}
