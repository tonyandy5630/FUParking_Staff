import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import { HotKeyTableHeaders } from "./content";
import { useMemo } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import { SUBMIT_LEFT_HOTKEY, SUBMIT_RIGHT_HOTKEY } from "../../../hotkeys/key";
import { HotkeyType } from "@my_types/hotkey-params";

interface Props {
  contents: HotkeyType[];
  tableCaption: string;
}
export default function HotKeyTable({ contents, tableCaption }: Props) {
  const tableBody = useMemo(() => {
    return contents.map((keyItem: HotkeyType) => {
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
          <TableCell className=''>
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
  }, [contents.length]);

  const tableHeaders = useMemo(() => {
    return HotKeyTableHeaders.map((header) => (
      <TableHead key={header}>{header}</TableHead>
    ));
  }, [HotKeyTableHeaders.length]);
  return (
    <div className='pb-2 border rounded-sm h-fit min-w-96'>
      <Table className='rounded-sm '>
        <TableCaption>{tableCaption}</TableCaption>
        <TableHeader>
          <TableRow>{tableHeaders}</TableRow>
        </TableHeader>
        <TableBody>{tableBody}</TableBody>
      </Table>
    </div>
  );
}
