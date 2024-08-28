import { DataTable } from "@components/Table";
import { memo, useCallback, useEffect, useMemo } from "react";
import SessionCardColumns from "../columns";
import { Session, SessionCard } from "@my_types/session-card";
import { useQuery } from "@tanstack/react-query";
import { getParkingSession } from "@apis/session.api";
import usePagination from "../../../hooks/usePagination";
import toLocaleDate from "@utils/date";
import { formatPlateNumber } from "@utils/plate-number";
import { useDispatch, useSelector } from "react-redux";
import { setNewSessionInfo, setNewTable } from "../../../redux/sessionSlice";
import wrapText from "@utils/text";
import useGetParkingId from "../../../hooks/useGetParkingId";
import { PARKED_SESSION_STATUS } from "@constants/session.const";
import { RootState } from "@utils/store";

function SessionTable() {
  const parkingId = useGetParkingId();
  const { pagination, onPaginationChange } = usePagination();
  const sessionTable = useSelector((state: RootState) => state.sessionTable);
  const dispatch = useDispatch();

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
    ],
    queryFn: () => getParkingSession({ pagination, parkingId }),
    enabled: parkingId !== "",
  });

  useEffect(() => {
    const sessions = sessionData?.data.data;
    if (!sessions) return;

    const addSession = sessions.map((item) => {
      return {
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
  );
}

export default SessionTable;
