import { DataTable } from "@components/Table";
import { memo, useMemo } from "react";
import SessionCardColumns from "../columns";
import { SessionCard } from "@my_types/session-card";
import { useQuery } from "@tanstack/react-query";
import { getParkingSession } from "@apis/session.api";
import usePagination from "../../../hooks/usePagination";
import toLocaleDate from "@utils/date";
import { formatPlateNumber } from "@utils/plate-number";
import { useDispatch } from "react-redux";
import { setNewSessionInfo } from "../../../redux/sessionSlice";
import wrapText from "@utils/text";

function SessionTable() {
  const pagination = usePagination();
  const dispatch = useDispatch();

  const setCardChecker = (cardInfo: SessionCard) => {
    dispatch(setNewSessionInfo(cardInfo));
  };
  const {
    data: sessionData,
    isLoading: isLoadingSession,
    isSuccess: isSuccessSession,
  } = useQuery({
    queryKey: [
      "/get-session-parking-area",
      pagination.pageIndex,
      pagination.pageSize,
      pagination,
    ],
    queryFn: () => getParkingSession(pagination),
  });

  const data: SessionCard[] = useMemo(() => {
    const sessions = sessionData?.data.data;
    if (!sessions) return [];

    return sessions
      .filter((item) => item.session !== null)
      .map((item) => {
        console.log(item);
        return {
          cardNumber: item.cardNumber,
          plateNumber: formatPlateNumber(item.session.plateNumber),
          cardStatus: item.isInUse ? "Parking" : "Free",
          sessionId: wrapText(item.session.sessionId, 14),
          vehicleType: item.session.vehicleType,
          timeIn: toLocaleDate(new Date(item.session.timeIn)),
          gateIn: item.session.gateIn,
        };
      });
  }, [sessionData?.data.data]);

  return (
    <DataTable
      columns={SessionCardColumns}
      data={data}
      onRowClick={setCardChecker}
    />
  );
}

export default SessionTable;
