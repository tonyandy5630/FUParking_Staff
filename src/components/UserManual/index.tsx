import CustomTooltip from "@components/Tooltip";
import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { PropsWithChildren, useRef, useState } from "react";
import HotKeyTable from "./HotKeyTable";
import { HELP_KEY } from "../../hotkeys/key";
import { useHotkeys } from "react-hotkeys-hook";

interface Props extends PropsWithChildren {}
export default function UserManualDialog({}: Props) {
  const [openRef, setOpenRef] = useState(false);
  useHotkeys(
    HELP_KEY.key,
    () => {
      handleOpenRef();
    },
    {
      enableOnFormTags: ["input"],
    }
  );

  const handleOpenRef = () => {
    setOpenRef((prev) => !prev);
  };

  return (
    <Dialog open={openRef} onOpenChange={handleOpenRef}>
      <CustomTooltip
        tooltip={
          <p>
            <span className='mr-1 hotkey'>{HELP_KEY.key}</span>Hỗ trợ
          </p>
        }
      >
        <DialogTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='rounded-full hover:bg-gray-500 '
          >
            <QuestionMarkCircledIcon className='rounded-full w-7 h-7 text-primary ' />
          </Button>
        </DialogTrigger>
      </CustomTooltip>
      <DialogContent>
        <DialogTitle>Hỗ trợ người dùng</DialogTitle>
        <DialogDescription>
          Bảng tổng hợp các phím tát và sử dụng ứng dụng BAI Parking System
        </DialogDescription>
        <HotKeyTable />
      </DialogContent>
    </Dialog>
  );
}
