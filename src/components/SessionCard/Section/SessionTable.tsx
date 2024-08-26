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
import useGetParkingId from "../../../hooks/useGetParkingId";

function SessionTable() {
  const parkingId = useGetParkingId();
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
      parkingId,
    ],
    queryFn: () => getParkingSession({ pagination, parkingId }),
    enabled: parkingId !== "",
  });

  const data: SessionCard[] = useMemo(() => {
    const sessions = sessionData?.data.data;
    if (!sessions) return [];

    return sessions.map((item) => {
      console.log(item);
      return {
        cardNumber: item.cardNumber,
        plateNumber: formatPlateNumber(item.plateNumber),
        cardStatus: item.status ? "Parking" : "Free",
        sessionId: wrapText(item.id, 14),
        vehicleType: item.vehicleTypeName,
        timeIn: toLocaleDate(new Date(item.timeIn)),
        gateIn: item.gateInName,
        imageInBodyUrl: item.imageInBodyUrl,
        imageInUrl: item.imageInUrl,
      } as SessionCard;
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
