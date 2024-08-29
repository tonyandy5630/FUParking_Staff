import RectangleContainer, { Rectangle } from "@components/Rectangle";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  getGateTotalIncomeAPI,
  getParkingAreaStatisticAPI,
} from "@apis/parking-area.api";
import React, { useEffect, useRef, useState } from "react";
import useGetParkingId from "../../../hooks/useGetParkingId";
import { Separator } from "@components/ui/separator";
import useSelectGate from "../../../hooks/useSelectGate";
import { GATE_OUT } from "@constants/gate.const";
import { formatVNCurrency } from "@utils/currency";

function ParkingSection() {
  const [parkingStats, setParkingStats] = useState({
    vehicleIn: 0,
    vehicleOut: 0,
    parkingCapacity: "0/0",
  });
  const parkingId = useGetParkingId();
  const { gateId: gateOutId } = useSelectGate(GATE_OUT, false);

  const [
    {
      data: statisticData,
      isLoading: isLoadingStatistic,
      isError: isErrorGettingStatistic,
      isSuccess: isSuccessGettingStatistic,
    },
    {
      data: incomeData,
      isLoading: isLoadingIncome,
      isError: isErrorGettingIncome,
      isSuccess: isSuccessGettingIncome,
    },
  ] = useQueries({
    queries: [
      {
        queryKey: ["/get-parking-statistic", parkingId],
        queryFn: () => getParkingAreaStatisticAPI(parkingId),
        enabled: parkingId !== "",
      },
      {
        queryKey: ["/get-gate-income", gateOutId],
        queryFn: () => getGateTotalIncomeAPI(gateOutId),
        enabled: gateOutId !== "",
      },
    ],
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
    <RectangleContainer
      className={`${gateOutId !== "" ? "grid-cols-4" : "grid-cols-3"}`}
    >
      <Rectangle isLoading={isLoadingStatistic} title='Tổng xe vào hôm nay'>
        {parkingStats.vehicleIn}
      </Rectangle>
      <Rectangle isLoading={isLoadingStatistic} title='Tổng xe ra hôm nay'>
        {parkingStats.vehicleOut}
      </Rectangle>
      <Rectangle isLoading={isLoadingStatistic} title='Số xe / Tối đa'>
        {parkingStats.parkingCapacity}
      </Rectangle>
      {gateOutId !== "" && (
        <Rectangle isLoading={isLoadingStatistic} title='Tổng tiền hôm nay'>
          {/* {parkingStats.parkingCapacity} */}
          <RectangleContainer className='grid-cols-[1fr_auto_1fr] gap-x-2 h-fit'>
            <Rectangle
              className='text-sm font-normal border-none'
              title='Qua Ví'
              isLoading={isLoadingIncome}
            >
              {formatVNCurrency(incomeData?.data.data.totalCashPayment)}
            </Rectangle>
            {/* <div className='max-w-1'> */}
            <Separator orientation='vertical' className='p-0' />
            {/* </div> */}
            <Rectangle
              className='text-sm font-normal border-none'
              title='Khác'
              isLoading={isLoadingIncome}
            >
              {formatVNCurrency(incomeData?.data.data.totalCashPayment)}
            </Rectangle>
          </RectangleContainer>
        </Rectangle>
      )}
    </RectangleContainer>
  );
}

export default React.memo(ParkingSection);
