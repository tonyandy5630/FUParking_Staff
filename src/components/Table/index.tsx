import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  PaginationState,
  Updater,
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
import { useMemo, useState } from "react";
import { Skeleton } from "@components/ui/skeleton";
import { ScrollArea } from "@components/ui/scroll-area";

const MAX_ROWS_TABLE = 6;
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick: (value: TData) => void;
  isLoading?: boolean;
  totalRecord: number;
  onPaginationChange: (updater: Updater<PaginationState>) => void;
  pagination: PaginationState;
  isError?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  isLoading,
  totalRecord,
  pagination,
  isError,
  onPaginationChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    onPaginationChange: onPaginationChange,
    rowCount: totalRecord,
    state: {
      pagination,
    },
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

    if (isError) {
      return (
        <TableRow>
          <TableCell
            colSpan={columns.length}
            className='text-center text-destructive'
          >
            Lỗi xảy ra khi lấy dữ liệu
          </TableCell>
        </TableRow>
      );
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
          Không có dữ liệu
        </TableCell>
      </TableRow>
    );
  }, [table.getRowModel().rows, isLoading]);
  return (
    <div className='max-h-[20rem] min-h-full relative min-w-full flex flex-col justify-between border rounded-md '>
      <ScrollArea className='w-full h-full '>
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
      <div className='flex items-center w-full min-w-full space-x-2 p-2S'>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
