import RectangleContainer, { Rectangle } from "@components/Rectangle";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  getGateTotalIncomeAPI,
  getParkingAreaStatisticAPI,
} from "@apis/parking-area.api";
import React, { useEffect, useMemo, useRef, useState } from "react";
import useGetParkingId from "../../../hooks/useGetParkingId";
import { Separator } from "@components/ui/separator";
import useSelectGate from "../../../hooks/useSelectGate";
import { GATE_OUT } from "@constants/gate.const";
import { formatVNCurrency } from "@utils/currency";
import { SelectOptions } from "@components/Form/FormSelect";
import {
  FILTER_DATE_VALUE,
  SelectDateFilter,
  SelectDateWithCustomFilter,
  SelectSessionStatusFilter,
} from "@constants/selects.const";
import {
  getStartAndEndDatesOfMonth,
  getStartAndEndDatesOfWeek,
} from "@utils/date";
import MySelect from "@components/MySelect";
import { DatePicker } from "@components/DatePicker";

function ParkingStatistic() {
  const [parkingStats, setParkingStats] = useState({
    vehicleIn: 0,
    vehicleOut: 0,
    parkingCapacity: "0/0",
  });
  const [apiDateFilter, setApiDateFilter] = useState({
    startDate: "",
    endDate: "",
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
        queryKey: [
          "/get-gate-income",
          gateOutId,
          apiDateFilter.startDate,
          apiDateFilter.endDate,
        ],
        queryFn: () =>
          getGateTotalIncomeAPI({
            gate: gateOutId,
            startDate: apiDateFilter.startDate,
            endDate: apiDateFilter.endDate,
          }),
        enabled: gateOutId !== "",
      },
    ],
  });

  const handleDateFilterChange = (date: string) => {
    setApiDateFilter((prev) => ({
      startDate: date,
      endDate: date,
    }));
  };

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
    <RectangleContainer className=' grid-rows-[auto_1fr]'>
      <RectangleContainer
        className={`  ${gateOutId !== "" ? "grid-cols-4" : "grid-cols-3"}`}
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
          <Rectangle
            isLoading={isLoadingStatistic}
            className='min-w-full'
            title={
              <>
                <span className='min-w-20'>Tổng tiền</span>{" "}
                <DatePicker onValueChange={handleDateFilterChange} />
              </>
            }
          >
            <RectangleContainer className='grid-cols-[1fr_auto_1fr] gap-x-2 h-fit'>
              <Rectangle
                className='text-sm font-normal border-none'
                title='Qua Ví'
                isLoading={isLoadingIncome}
              >
                {formatVNCurrency(incomeData?.data.data.totalWalletPayment)}
              </Rectangle>
              <Separator orientation='vertical' className='p-0' />
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
    </RectangleContainer>
  );
}

export default React.memo(ParkingStatistic);
