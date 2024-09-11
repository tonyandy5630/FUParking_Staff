import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import { HotKeyContents, HotKeyTableHeaders } from "./content";
import { useMemo } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { SUBMIT_LEFT_HOTKEY, SUBMIT_RIGHT_HOTKEY } from "../../../hotkeys/key";

export default function HotKeyTable() {
  const tableBody = useMemo(() => {
    return HotKeyContents.map((keyItem) => {
      let key: any = keyItem.key;
      if (keyItem.key === SUBMIT_LEFT_HOTKEY.key) {
        key = (
          <div className='flex items-center gap-1 w-max'>
            Phím trái
            <ArrowLeftIcon />
          </div>
        );
      } else if (keyItem.key === SUBMIT_RIGHT_HOTKEY.key) {
        key = (
          <div className='flex items-center gap-1 w-max'>
            Phím phải
            <ArrowRightIcon />
          </div>
        );
      }
      return (
        <TableRow key={keyItem.key}>
          <TableCell className='hotkey'>{key}</TableCell>
          <TableCell>
            {Array.isArray(keyItem.function) ? (
              <>
                {keyItem.function.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </>
            ) : (
              keyItem.function
            )}
          </TableCell>
        </TableRow>
      );
    });
  }, [HotKeyContents.length]);

  const tableHeaders = useMemo(() => {
    return HotKeyTableHeaders.map((header) => (
      <TableHead key={header}>{header}</TableHead>
    ));
  }, [HotKeyTableHeaders.length]);
  return (
    <Table>
      <TableCaption>Tổng hợp các phím tắt</TableCaption>
      <TableHeader>
        <TableRow>{tableHeaders}</TableRow>
      </TableHeader>
      <TableBody>{tableBody}</TableBody>
    </Table>
  );
}
