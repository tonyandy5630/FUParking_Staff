import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@utils/utils";
import * as React from "react";

const frameVariants = cva(
  "border-4 outline-offset-2 border-solid border-black aspect-video",
  {
    variants: {
      size: {
        md: "w-camera-md",
        sm: "w-camera-sm",
      },
      type: {
        success: "border-green-500",
        regular: "border",
        error: "border-red-500",
        loading: "border-yellow-500",
      },
    },
    defaultVariants: {
      size: "md",
      type: "regular",
    },
  }
);

interface FrameProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof frameVariants> {
  title?: string;
}

export default function Frame({
  children,
  className,
  size = "md",
  title,
  type = "regular",
}: FrameProps) {
  return (
    <div>
      <p className='min-w-full text-center'>{title}</p>
      <div className={cn(frameVariants({ size, className, type }))}>
        {children}
      </div>
    </div>
  );
}
