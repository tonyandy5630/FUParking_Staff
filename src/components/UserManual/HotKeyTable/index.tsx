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
    return HotKeyContents.map((hotkey) => {
      let key: any = hotkey.hotkey;
      if (hotkey.hotkey === SUBMIT_LEFT_HOTKEY.key) {
        key = (
          <div className='flex items-center gap-1 w-max'>
            Phím trái
            <ArrowLeftIcon />
          </div>
        );
      } else if (hotkey.hotkey === SUBMIT_RIGHT_HOTKEY.key) {
        key = (
          <div className='flex items-center gap-1 w-max'>
            Phím phải
            <ArrowRightIcon />
          </div>
        );
      }
      return (
        <TableRow key={hotkey.hotkey}>
          <TableCell className='hotkey'>{key}</TableCell>
          <TableCell>
            {Array.isArray(hotkey.function) ? (
              <>
                {hotkey.function.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </>
            ) : (
              hotkey.function
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
