import { DataTable } from "@components/Table";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import SessionCardColumns from "../columns";
import { Session, SessionCard } from "@my_types/session-card";
import { useQuery } from "@tanstack/react-query";
import { getParkingSession } from "@apis/session.api";
import usePagination from "../../../hooks/usePagination";
import toLocaleDate, {
  getStartAndEndDatesOfMonth,
  getStartAndEndDatesOfWeek,
} from "@utils/date";
import { formatPlateNumber } from "@utils/plate-number";
import { useDispatch, useSelector } from "react-redux";
import { setNewSessionInfo, setNewTable } from "../../../redux/sessionSlice";
import wrapText from "@utils/text";
import useGetParkingId from "../../../hooks/useGetParkingId";
import { PARKED_SESSION_STATUS } from "@constants/session.const";
import { RootState } from "@utils/store";
import MySelect from "@components/MySelect";
import { FITLER_DATE_VALUE, SelectDateFilter } from "@constants/selects.const";

function SessionTable() {
  const parkingId = useGetParkingId();
  const { pagination, onPaginationChange } = usePagination();
  const sessionTable = useSelector((state: RootState) => state.sessionTable);
  const dispatch = useDispatch();
  const [dateFilter, setDateFilter] = useState("");
  const [apiDateFilter, setApiDateFilter] = useState<{
    startDate?: string;
    endDate?: string;
  }>({
    startDate: undefined,
    endDate: undefined,
  });

  const setCardChecker = (cardInfo: SessionCard) => {
    dispatch(setNewSessionInfo(cardInfo));
  };

  const {
    data: sessionData,
    isLoading: isLoadingSession,
    isSuccess: isSuccessSession,
    isError: isErrorSession,
  } = useQuery({
    queryKey: [
      "/get-session-parking-area",
      pagination.pageIndex,
      pagination.pageSize,
      pagination,
      parkingId,
      apiDateFilter.startDate,
      apiDateFilter.endDate,
    ],
    queryFn: () =>
      getParkingSession({
        pagination,
        parkingId,
        startDate: apiDateFilter.startDate,
        endDate: apiDateFilter.endDate,
      }),
    enabled: parkingId !== "",
  });

  const handleSetDateFilter = (e: string) => {
    setDateFilter(e);
    if (e === FITLER_DATE_VALUE.TODAY) {
      setApiDateFilter({ startDate: undefined, endDate: undefined });
      return;
    }

    if (e === FITLER_DATE_VALUE.WEEK) {
      const { startDate, endDate } = getStartAndEndDatesOfWeek();
      setApiDateFilter({ startDate, endDate });
      return;
    }

    if (e === FITLER_DATE_VALUE.MONTH) {
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
    <div className='grid grid-rows-[auto_1fr] h-full'>
      <div className='grid max-h-full p-1 w-fit auto-cols-auto'>
        <MySelect
          options={SelectDateFilter}
          label='Thống kê'
          placeholder='Chọn thời gian'
          value={dateFilter}
          onValueChange={handleSetDateFilter}
        />
      </div>
      <DataTable
        columns={SessionCardColumns}
        data={sessionTable}
        onRowClick={setCardChecker}
        isLoading={isLoadingSession}
        totalRecord={sessionData?.data.totalRecord ?? 0}
        onPaginationChange={onPaginationChange}
        pagination={pagination}
        isError={isErrorSession}
      />
    </div>
  );
}

export default SessionTable;