import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import { DataTablePagination } from "./Pagination";
import { useMemo } from "react";
import { Skeleton } from "@components/ui/skeleton";
import { ScrollArea } from "@components/ui/scroll-area";

const MAX_ROWS_TABLE = 6;
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick: (value: TData) => void;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const tableRows = useMemo(() => {
    if (isLoading) {
      const loadUI = Array.from({ length: MAX_ROWS_TABLE }, (_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={columns.length}>
            <Skeleton className='w-full h-10' />
          </TableCell>
        </TableRow>
      ));
      return loadUI;
    }

    return table.getRowModel().rows?.length ? (
      table.getRowModel().rows.map((row) => (
        <TableRow
          key={row.id}
          data-state={row.getIsSelected() && "selected"}
          onClick={() => {
            onRowClick(row.original);
          }}
          className='hover:cursor-pointer'
        >
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))
    ) : (
      <TableRow>
        <TableCell colSpan={columns.length} className='text-center'>
          No results.
        </TableCell>
      </TableRow>
    );
  }, [table.getRowModel().rows, isLoading]);

  return (
    <div className='max-h-[600px] relative min-w-full flex flex-col justify-between border rounded-md '>
      <ScrollArea className=' max-h-[550px] w-full h-full'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>{tableRows}</TableBody>
        </Table>
      </ScrollArea>
      <div className='flex items-center w-full min-w-full py-4 space-x-2'>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
