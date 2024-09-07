import { Button } from "@components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  title: string;
  onConfirmSubmit: () => void | Promise<void>;
  onCancel?: () => void;
  text?: string;
  open: boolean;
  onOpenChange: () => void;
}

export default function ConfirmDialog({
  title,
  onConfirmSubmit,
  onCancel,
  text,
  onOpenChange,
  open,
}: Props) {
  const handleOpenChange = () => {
    onOpenChange();
  };

  const handleCancel = (e: any) => {
    onOpenChange();
    if (onCancel) onCancel();
  };

  const handleSubmit = async (e: any) => {
    onOpenChange;
    await onConfirmSubmit();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-xs'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className='font-bold text-muted-foreground'>{text}</p>
        <DialogFooter className='grid grid-cols-2'>
          <Button variant='destructive' onClick={handleCancel} autoFocus>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Xác nhận</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
