import { DataTable } from "@components/Table";
import { useEffect, useState } from "react";
import SessionCardColumns from "../columns";
import { SessionCard } from "@my_types/session-card";
import { useQuery } from "@tanstack/react-query";
import { getParkingSession } from "@apis/session.api";
import usePagination from "../../../hooks/usePagination";
import toLocaleDate, {
  getLocalISOString,
  getStartAndEndDatesOfMonth,
  getStartAndEndDatesOfWeek,
  setTimeToDateMoment,
} from "@utils/date";
import { useDispatch } from "react-redux";
import { setNewSessionInfo, setNewTable } from "../../../redux/sessionSlice";
import useGetParkingId from "../../../hooks/useGetParkingId";
import { ALL_STATUS, PARKED_SESSION_STATUS } from "@constants/session.const";
import { useAppSelector } from "@utils/store";
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
import { Moment } from "moment";
import MyTimePicker from "@components/TimePicker";

function SessionTable() {
  const parkingId = useGetParkingId();
  const { pagination, onPaginationChange } = usePagination();
  const sessionTable = useAppSelector((state) => state.sessionTable);
  const dispatch = useDispatch();
  const [dateFilter, setDateFilter] = useState(FILTER_DATE_VALUE.TODAY.string);
  const [statusFilter, setStatusFilter] = useState("");
  const [plateText, setPlateText] = useState("");
  const [debouncePlateText] = useDebounce(plateText, 750);
  const [apiDateFilter, setApiDateFilter] = useState<{
    startDate?: string;
    endDate?: string;
  }>({
    startDate: getLocalISOString(new Date()),
    endDate: getLocalISOString(new Date()),
  });
  const [apiHourFilter, setApiHourFilter] = useState<{
    startHour: Moment | null;
    endHour: Moment | null;
  }>({
    startHour: null,
    endHour: null,
  });
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

  const setCardChecker = (cardInfo: SessionCard) => {
    dispatch(setNewSessionInfo(cardInfo));
  };

  const handleFromHourChange = (addHours: Moment | null) => {
    if (addHours === null) {
      return;
    }
    const newStartDate = setTimeToDateMoment(apiDateFilter.startDate, addHours);
    setApiHourFilter((prev) => ({ ...prev, startHour: addHours }));
    setApiDateFilter((prev) => ({
      prev,
      startDate: newStartDate,
    }));
  };

  const handleToHourChange = (addHours: Moment | null) => {
    if (addHours === null) {
      return;
    }
    const newEndDate = setTimeToDateMoment(apiDateFilter.endDate, addHours);
    setApiHourFilter((prev) => ({ ...prev, endHour: addHours }));
    setApiDateFilter((prev) => ({
      prev,
      startDate: newEndDate,
    }));
  };

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
    if (e === FILTER_DATE_VALUE.TODAY.string) {
      setApiDateFilter({ startDate: "", endDate: "" });
      return;
    }

    if (e === FILTER_DATE_VALUE.WEEK.string) {
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
        <div className='flex items-end gap-2'>
          <div className='flex flex-col items-start gap-2 min-w-fit'>
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
          <MySelect
            col={true}
            options={SelectDateFilter}
            label='Thống kê'
            className='w-[7rem]'
            placeholder='Chọn thời gian'
            value={dateFilter}
            onValueChange={handleSetDateFilter}
          />
          <MyTimePicker
            value={apiHourFilter.startHour}
            onValueChange={handleFromHourChange}
            label='Từ'
          />
          <MyTimePicker
            value={apiHourFilter.endHour}
            onValueChange={handleToHourChange}
            label='Tới'
          />
          <div className='min-w-32'>
            <MySelect
              col={true}
              options={SelectSessionStatusFilter}
              label='Trạng thái phiên'
              placeholder='Tất cả'
              value={statusFilter}
              onValueChange={handleSetStatusFilter}
            />
          </div>
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
