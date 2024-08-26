import { Pagination } from "@my_types/pagination";
import { useState } from "react";

const initState: Pagination = {
  pageIndex: 1,
  pageSize: 10,
};

export default function usePagination(pageSize?: number): Pagination {
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: initState.pageIndex,
    pageSize: pageSize ?? initState.pageSize,
  });

  return {
    pageSize: pagination.pageSize,
    pageIndex: pagination.pageIndex,
  };
}
