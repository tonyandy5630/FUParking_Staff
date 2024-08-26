import RectangleContainer, { Rectangle } from "@components/Rectangle";
import { useQuery } from "@tanstack/react-query";
import { getParkingAreaStatisticAPI } from "@apis/parking-area.api";
import React, { useEffect, useRef } from "react";
import { Skeleton } from "@components/ui/skeleton";

function ParkingSection() {
  const vehicleIn = useRef<number>(0);
  const vehicleOut = useRef<number>(0);
  const parkingCapacity = useRef<string>("0/0");

  const {
    data: statisticData,
    isLoading: isLoadingStatistic,
    isError: isErrorGettingStatistic,
    isSuccess: isSuccessGettingStatistic,
  } = useQuery({
    queryKey: ["/get-parking-statistic"],
    queryFn: () => getParkingAreaStatisticAPI(""),
  });

  useEffect(() => {
    const statistic = statisticData?.data.data;
    if (!statistic) return;

    const {
      totalCheckInToday,
      totalCheckOutToday,
      totalLot,
      totalVehicleParked,
    } = statistic;
    vehicleIn.current = totalCheckInToday;
    vehicleOut.current = totalCheckOutToday;
    parkingCapacity.current = `${totalVehicleParked}/${totalLot}`;
  }, [statisticData?.data.data]);

  return (
    <RectangleContainer className='grid-cols-3'>
      <Rectangle isLoading={isLoadingStatistic} title='Tổng số lượt xe vào'>
        {vehicleIn.current}
      </Rectangle>
      <Rectangle isLoading={isLoadingStatistic} title='Tổng số lượt xe ra'>
        {vehicleOut.current}
      </Rectangle>
      <Rectangle isLoading={isLoadingStatistic} title='Tổng xe trong bãi'>
        {parkingCapacity.current}
      </Rectangle>
    </RectangleContainer>
  );
}

export default React.memo(ParkingSection);
