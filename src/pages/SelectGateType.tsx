import { getAllGateAPI, getGateByParkingAreaIdAPI } from "@apis/gate.api";
import { getAllParkingAreaAPI } from "@apis/parking-area.api";
import {
  GET_GATE_IN_ID_CHANNEL,
  GET_GATE_OUT_ID_CHANNEL,
  GET_GATE_TYPE_CHANNEL,
  GET_PARKING_AREA_ID_CHANNEL,
  LOGGED_IN,
  SET_GATE_CHANNEL,
  SET_NOT_FIRST_TIME_CHANNEL,
  SET_PARKING_AREA_ID_CHANNEL,
} from "@channels/index";
import FormItem from "@components/CameraSection/Form/FormItem";
import { Button } from "@components/ui/button";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PAGE from "../../url";
import { GATE_IN, GATE_OUT } from "@constants/gate.const";
import { GateType } from "@my_types/gate";
import useGetParkingId from "../hooks/useGetParkingId";
import { SelectOptions } from "@components/Form/FormSelect";
import MySelect from "@components/MySelect";
import useSelectGate from "../hooks/useSelectGate";

export default function SelectGateTypePage() {
  const parkingId = useGetParkingId();
  const { gateId: gateInId } = useSelectGate(GATE_IN);
  const { gateId: gateOutId } = useSelectGate(GATE_OUT);
  const [selectedParkingId, setSelectedParkingId] = useState<string>("");

  const [selectedGateInId, setSelectedGateInId] = useState<string>();
  const [selectedGateOutId, setSelectedGateOutId] = useState<string>();
  const [parkingAreaGateAmount, setParkingAreaGateAmount] = useState(0);
  const navigate = useNavigate();

  const {
    data: gatesData,
    isLoading: isLoadingGates,
    isSuccess: isSuccessGate,
  } = useQuery({
    queryKey: ["/gate-all", selectedParkingId],
    queryFn: () => getGateByParkingAreaIdAPI(selectedParkingId),
    enabled: selectedParkingId !== "",
  });

  const { data: parkingAreasData, isLoading: isLoadingParkingArea } = useQuery({
    queryKey: ["/parking-areas-options"],
    queryFn: getAllParkingAreaAPI,
  });

  const handleParkingAreaIdChange = (value: string) => {
    setSelectedParkingId(value);
  };

  const allGateOptions = useCallback(
    (gateType: GateType): SelectOptions[] => {
      const gates = gatesData?.data.data;

      if (!gates) {
        setParkingAreaGateAmount(0);
        return [];
      }

      setParkingAreaGateAmount(gates.length);
      return gates
        .filter((item) => item.gateType === gateType)
        .map((item) => {
          return {
            name: item.name,
            value: item.id,
          };
        });
    },
    [gatesData?.data.data, setParkingAreaGateAmount]
  );

  const gateInSelects: SelectOptions[] = useMemo(() => {
    const gates = allGateOptions(GATE_IN);

    if (!gates) {
      return [];
    }

    const systemSelectedGate = gates.find((item) => item.value === gateInId);
    if (systemSelectedGate) setSelectedGateInId(systemSelectedGate.value);

    return gates;
  }, [allGateOptions, gateInId, setSelectedGateInId]);

  const gateOutSelects: SelectOptions[] = useMemo(() => {
    const gates = allGateOptions(GATE_OUT);

    if (!gates) {
      return [];
    }
    const systemSelectedGate = gates.find((item) => item.value === gateOutId);
    if (systemSelectedGate) setSelectedGateOutId(systemSelectedGate.value);
    return gates;
  }, [allGateOptions, gateOutId]);

  const parkingAreaSelects: SelectOptions[] = useMemo(() => {
    const parkingAreas = parkingAreasData?.data.data;
    if (!parkingAreas) return [];
    if (parkingId !== "") setSelectedParkingId(parkingId);

    return parkingAreas.map((item) => {
      return {
        name: item.name,
        value: item.id,
      };
    });
  }, [parkingAreasData?.data.data, parkingId, setSelectedParkingId]);

  const handleGateInChange = (value: string) => {
    setSelectedGateInId(value);
  };

  const handleGateOutChange = (value: string) => {
    setSelectedGateOutId(value);
  };

  const handleConfirmGate = async () => {
    try {
      const gates = gatesData?.data.data;
      if (!gates) return;

      if (gates.length === 0) return;

      const currentGate = gates.find((item) => item.id === selectedGateInId);
      if (!currentGate) {
        return;
      }

      const gateType = currentGate.gateType;

      window.ipcRenderer.send(SET_GATE_CHANNEL, {
        id: selectedGateInId,
        type: gateType,
      });
      window.ipcRenderer.send(SET_PARKING_AREA_ID_CHANNEL, selectedParkingId);

      const newParkingAreaId = await window.ipcRenderer.invoke(
        GET_PARKING_AREA_ID_CHANNEL
      );

      const newGateType = await window.ipcRenderer.invoke(
        GET_GATE_TYPE_CHANNEL
      );

      await Promise.all([newGateType, newParkingAreaId]);

      let gateId: string | undefined;

      switch (gateType) {
        case GATE_IN:
          gateId = await window.ipcRenderer.invoke(GET_GATE_IN_ID_CHANNEL);
          break;
        case GATE_OUT:
          gateId = await window.ipcRenderer.invoke(GET_GATE_OUT_ID_CHANNEL);
          break;
        default:
          toast.error("Invalid gate type");
          return;
      }

      if (!gateId) {
        toast.error("Failed to retrieve gate ID");
        window.ipcRenderer.send(SET_NOT_FIRST_TIME_CHANNEL, false);
        return;
      }

      if (!newParkingAreaId) {
        toast.error("Failed to retrieve new parking area");
        window.ipcRenderer.send(SET_NOT_FIRST_TIME_CHANNEL, false);
        return;
      }

      if (!newGateType) {
        toast.error("Failed to retrieve new gate type");
        window.ipcRenderer.send(SET_NOT_FIRST_TIME_CHANNEL, false);
        return;
      }

      window.ipcRenderer.send(SET_NOT_FIRST_TIME_CHANNEL, true);
      if (newGateType === GATE_IN) {
        window.ipcRenderer.send(LOGGED_IN, true);
        navigate(PAGE.CHECK_IN);
        return;
      } else if (newGateType === GATE_OUT) {
        window.ipcRenderer.send(LOGGED_IN, true);
        navigate(PAGE.CHECK_OUT);
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <main className='flex flex-col items-center justify-center min-h-full gap-y-10 min-w-screen'>
        <div className='flex items-center justify-center min-w-full p-3 text-4xl font-bold'>
          <h3 className='uppercase '>Cài đặt cổng</h3>
        </div>
        <div className='grid w-1/4 h-full grid-rows-3 gap-3'>
          <div className='grid grid-rows-[1fr_auto]'>
            <MySelect
              label='Bãi giữ xe'
              col={true}
              value={selectedParkingId}
              placeholder={
                isLoadingParkingArea ? "Đang tải dữ liệu" : "Chọn Bãi giữ xe"
              }
              onValueChange={handleParkingAreaIdChange}
              disabled={isLoadingParkingArea}
              options={parkingAreaSelects}
            />
            <div className='grid'>
              {selectedParkingId === "" && !isLoadingParkingArea ? (
                <p className='text-destructive'>Hãy chọn bãi giữ xe </p>
              ) : (
                <p>
                  Bãi xe này có{" "}
                  <span className='font-bold'>{parkingAreaGateAmount}</span>{" "}
                  cổng
                </p>
              )}
            </div>
          </div>
          <div className='grid gap-2'>
            <MySelect
              label='Chọn cổng vào'
              col={true}
              value={selectedGateInId}
              onValueChange={handleGateInChange}
              options={gateInSelects}
              placeholder='Chọn cổng vào'
              disabled={
                isLoadingGates ||
                selectedParkingId === "" ||
                parkingAreaGateAmount === 0
              }
            />
            <MySelect
              label='Chọn cổng ra'
              col={true}
              value={selectedGateOutId}
              onValueChange={handleGateOutChange}
              options={gateOutSelects}
              placeholder='Chọn cổng vào'
              disabled={
                isLoadingGates ||
                selectedParkingId === "" ||
                parkingAreaGateAmount === 0
              }
            />
          </div>
          <div className='grid grid-cols-2 gap-1'>
            <Button variant='destructive'>Hủy</Button>
            <Button
              disabled={selectedGateInId === ""}
              onClick={async () => await handleConfirmGate()}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
