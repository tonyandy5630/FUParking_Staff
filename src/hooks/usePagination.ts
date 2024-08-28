import { Pagination } from "@my_types/pagination";
import { PaginationState, Updater } from "@tanstack/react-table";
import { useState } from "react";

const initState: Pagination = {
  pageIndex: 0,
  pageSize: 10,
};

export default function usePagination(pageSize?: number): {
  pagination: PaginationState;
  onPaginationChange: (updater: Updater<PaginationState>) => void;
} {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initState.pageIndex,
    pageSize: pageSize ?? initState.pageSize,
  });

  return {
    pagination,
    onPaginationChange: setPagination,
  };
}
