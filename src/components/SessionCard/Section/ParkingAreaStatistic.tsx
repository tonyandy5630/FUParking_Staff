import RectangleContainer, { Rectangle } from "@components/Rectangle";
import { useQuery } from "@tanstack/react-query";
import { getParkingAreaStatisticAPI } from "@apis/parking-area.api";
import React, { useEffect, useRef, useState } from "react";
import useGetParkingId from "../../../hooks/useGetParkingId";
import { Separator } from "@components/ui/separator";

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
    <RectangleContainer className='grid-cols-4'>
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
      <Rectangle isLoading={isLoadingStatistic} title='Tổng tiền trong ngày'>
        {/* {parkingStats.parkingCapacity} */}
        <RectangleContainer className='grid-cols-[1fr_auto_1fr] gap-x-2 h-fit'>
          <Rectangle
            className='text-sm font-normal border-none'
            title='Qua Ví'
            isLoading={isLoadingStatistic}
          >
            0
          </Rectangle>
          {/* <div className='max-w-1'> */}
          <Separator orientation='vertical' className='p-0' />
          {/* </div> */}
          <Rectangle
            className='text-sm font-normal border-none'
            title='Khác'
            isLoading={isLoadingStatistic}
          >
            0
          </Rectangle>
        </RectangleContainer>
      </Rectangle>
    </RectangleContainer>
  );
}

export default React.memo(ParkingSection);
