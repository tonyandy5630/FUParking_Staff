import { DataTable } from "@components/Table";
import { useEffect, useState } from "react";
import SessionCardColumns from "../columns";
import { SessionCard } from "@my_types/session-card";
import { useQuery } from "@tanstack/react-query";
import { getParkingSession } from "@apis/session.api";
import usePagination from "../../../hooks/usePagination";
import toLocaleDate, {
  getStartAndEndDatesOfMonth,
  getStartAndEndDatesOfWeek,
} from "@utils/date";
import { useDispatch, useSelector } from "react-redux";
import { setNewSessionInfo, setNewTable } from "../../../redux/sessionSlice";
import useGetParkingId from "../../../hooks/useGetParkingId";
import { ALL_STATUS, PARKED_SESSION_STATUS } from "@constants/session.const";
import { RootState } from "@utils/store";
import MySelect from "@components/MySelect";
import {
  FILTER_DATE_VALUE,
  SelectDateFilter,
  SelectSessionStatusFilter,
} from "@constants/selects.const";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { useDebounce } from "use-debounce";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Button } from "@components/ui/button";

function SessionTable() {
  const parkingId = useGetParkingId();
  const { pagination, onPaginationChange } = usePagination();
  const sessionTable = useSelector((state: RootState) => state.sessionTable);
  const dispatch = useDispatch();
  const [dateFilter, setDateFilter] = useState(FILTER_DATE_VALUE.TODAY);
  const [statusFilter, setStatusFilter] = useState("");
  const [plateText, setPlateText] = useState("");
  const [debouncePlateText] = useDebounce(plateText, 750);
  const [apiDateFilter, setApiDateFilter] = useState<{
    startDate?: string | null;
    endDate?: string | null;
  }>({
    startDate: "",
    endDate: "",
  });

  const setCardChecker = (cardInfo: SessionCard) => {
    dispatch(setNewSessionInfo(cardInfo));
  };

  const {
    data: sessionData,
    isLoading: isLoadingSession,
    isSuccess: isSuccessSession,
    isError: isErrorSession,
    isRefetching: isRefetchingSession,
    isRefetchError: isRefetchError,
    refetch,
  } = useQuery({
    queryKey: [
      "/get-session-parking-area",
      pagination.pageIndex,
      pagination.pageSize,
      pagination,
      parkingId,
      apiDateFilter.startDate,
      apiDateFilter.endDate,
      debouncePlateText,
      statusFilter,
    ],
    queryFn: () =>
      getParkingSession({
        pagination,
        parkingId,
        startDate: apiDateFilter.startDate as string,
        endDate: apiDateFilter.endDate as string,
        plateNum: debouncePlateText,
        statusFilter,
      }),
    enabled: parkingId !== "",
  });

  const handlePlateTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlateText(e.target.value);
  };

  const handleSetStatusFilter = (e: string) => {
    if (e === ALL_STATUS) {
      setStatusFilter("");
      return;
    }
    setStatusFilter(e);
  };

  const handleSetDateFilter = (e: string) => {
    setDateFilter(e);
    if (e === FILTER_DATE_VALUE.TODAY) {
      setApiDateFilter({ startDate: "", endDate: "" });
      return;
    }

    if (e === FILTER_DATE_VALUE.WEEK) {
      const { startDate, endDate } = getStartAndEndDatesOfWeek();
      setApiDateFilter({ startDate, endDate });
      return;
    }

    if (e === FILTER_DATE_VALUE.MONTH) {
      const startEndDate = getStartAndEndDatesOfMonth();
      setApiDateFilter(startEndDate);
      return;
    }
  };

  useEffect(() => {
    const sessions = sessionData?.data.data;
    if (!sessions) return;
    const addSession = sessions.map((item, i) => {
      const currentPos = pagination.pageSize * pagination.pageIndex + i + 1;
      return {
        index: currentPos,
        cardNumber: item.cardNumber,
        plateNumber: item.plateNumber,
        cardStatus:
          item.status === PARKED_SESSION_STATUS ? "Đang giữ xe" : "Đã kết thúc",
        sessionId: item.id,
        vehicleType: item.vehicleTypeName,
        timeIn: toLocaleDate(new Date(item.timeIn)),
        gateIn: item.gateInName,
        imageInBodyUrl: item.imageInBodyUrl,
        imageInUrl: item.imageInUrl,
        isClosed: item.status !== PARKED_SESSION_STATUS,
      } as SessionCard;
    });
    dispatch(setNewTable(addSession));

    return () => {};
  }, [sessionData?.data.data]);

  return (
    <div className='grid grid-rows-[auto_1fr] h-full justify-items-end'>
      <div className='grid items-end justify-between w-full max-h-full grid-flow-col gap-2 pb-1 auto-cols-auto'>
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full'
          onClick={() => refetch()}
        >
          <ReloadIcon />
        </Button>
        <div className='flex gap-2'>
          <div className='flex items-center gap-2 min-w-fit'>
            <Label htmlFor='search-plate-input' className=' min-w-16'>
              Tìm kiếm
            </Label>
            <Input
              id='search-plate-input'
              value={plateText}
              className='h-9'
              onChange={handlePlateTextChange}
              placeholder='Nhập biển số'
            />
          </div>
          <div className='min-w-60'>
            <MySelect
              options={SelectSessionStatusFilter}
              label='Trạng thái phiên'
              placeholder='Tất cả'
              value={statusFilter}
              onValueChange={handleSetStatusFilter}
            />
          </div>
          <MySelect
            options={SelectDateFilter}
            label='Thống kê'
            placeholder='Chọn thời gian'
            value={dateFilter}
            onValueChange={handleSetDateFilter}
          />
        </div>
      </div>
      <DataTable
        columns={SessionCardColumns}
        data={sessionTable}
        onRowClick={setCardChecker}
        isLoading={isLoadingSession || isRefetchingSession}
        totalRecord={sessionData?.data.totalRecord ?? 0}
        onPaginationChange={onPaginationChange}
        pagination={pagination}
        isError={isErrorSession || isRefetchError}
      />
    </div>
  );
}

export default SessionTable;
