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
import { PropsWithChildren, useState } from "react";
import HotKeyTable from "./HotKeyTable";
import { HELP_KEY } from "../../hotkeys/key";
import { useHotkeys } from "react-hotkeys-hook";
import {
  GeneralHotKeys,
  LeftHotKeys,
  RightHotKeys,
} from "./HotKeyTable/content";
import useGet2Lane from "../../hooks/useGet2Lane";
import LaneRadioGroup from "@components/LaneRadioGroup";
import { ScrollArea } from "@components/ui/scroll-area";
import useToggleLaneMode from "../../hooks/useToggleLaneMode";

interface Props extends PropsWithChildren {}
export default function UserManualDialog({}: Props) {
  const [openRef, setOpenRef] = useState(false);
  const { is2Lane: isSetting2Lane } = useToggleLaneMode();
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
      <DialogContent className='max-w-screen-xl max-h-lvh'>
        <DialogTitle>Hỗ trợ người dùng</DialogTitle>
        <DialogDescription>
          Bảng tổng hợp các phím tát và sử dụng ứng dụng BAI Parking System
        </DialogDescription>
        <ScrollArea className='max-h-[35rem] px-4'>
          <div className='flex flex-col items-start justify-center py-2'>
            <LaneRadioGroup is2Lane={isSetting2Lane} />
          </div>
          <div className='max-h-[42rem]'>
            <div className='grid grid-rows-[1fr_auto] gap-2'>
              <div className='grid grid-cols-2 gap-2'>
                <HotKeyTable
                  contents={LeftHotKeys}
                  tableCaption='Tổng hợp phím tắt làn trái'
                />
                <HotKeyTable
                  contents={RightHotKeys}
                  tableCaption='Tổng hợp phím tắt làn phải'
                />
              </div>
              <div className='flex justify-center w-full h-fit'>
                <HotKeyTable
                  contents={GeneralHotKeys}
                  tableCaption='Tổng hợp phím tắt chung'
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
