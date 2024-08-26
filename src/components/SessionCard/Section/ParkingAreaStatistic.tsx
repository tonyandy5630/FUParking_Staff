import RectangleContainer, { Rectangle } from "@components/Rectangle";
import { useQuery } from "@tanstack/react-query";
import { getParkingAreaStatisticAPI } from "@apis/parking-area.api";
import React, { useEffect, useRef, useState } from "react";
import useGetParkingId from "../../../hooks/useGetParkingId";

function ParkingSection() {
  const [parkingStats, setParkingStats] = useState({
    vehicleIn: 0,
    vehicleOut: 0,
    parkingCapacity: "0/0",
  });
  const parkingId = useGetParkingId();

  const {
    data: statisticData,
    isLoading: isLoadingStatistic,
    isError: isErrorGettingStatistic,
    isSuccess: isSuccessGettingStatistic,
  } = useQuery({
    queryKey: ["/get-parking-statistic", parkingId],
    queryFn: () => getParkingAreaStatisticAPI(parkingId),
    enabled: parkingId !== "",
  });

  useEffect(() => {
    if (parkingId === "") return;
    const statistic = statisticData?.data.data;
    if (!statistic) return;

    const {
      totalCheckInToday,
      totalCheckOutToday,
      totalLot,
      totalVehicleParked,
    } = statistic;
    setParkingStats({
      vehicleIn: totalCheckInToday,
      vehicleOut: totalCheckOutToday,
      parkingCapacity: `${totalVehicleParked}/${totalLot}`,
    });
  }, [statisticData?.data.data, parkingId]);

  return (
    <RectangleContainer className='grid-cols-3'>
      <Rectangle isLoading={isLoadingStatistic} title='Tổng số lượt xe vào'>
        {parkingStats.vehicleIn}
      </Rectangle>
      <Rectangle isLoading={isLoadingStatistic} title='Tổng số lượt xe ra'>
        {parkingStats.vehicleOut}
      </Rectangle>
      <Rectangle
        isLoading={isLoadingStatistic}
        title='Xe trong bãi / Lượng xe có thể chứa'
      >
        {parkingStats.parkingCapacity}
      </Rectangle>
    </RectangleContainer>
  );
}

export default React.memo(ParkingSection);
