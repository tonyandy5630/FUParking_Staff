import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";
import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  tooltip?: React.ReactNode;
}

export default function CustomTooltip({ children, tooltip = "" }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <div>{tooltip}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
