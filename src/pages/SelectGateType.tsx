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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PAGE from "../../url";
import { GATE_IN, GATE_OUT } from "@constants/gate.const";
import { GateType } from "@my_types/gate";

export default function SelectGateTypePage() {
  const [selectedParkingId, setSelectedParkingId] = useState<string>("");
  const [selectedGateId, setSelectedGateId] = useState<string>("");
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

  const gateSelects = useMemo(() => {
    const gates = gatesData?.data.data;

    if (!gates) return [];

    return gates.map((item) => {
      return (
        <SelectItem key={item.id} value={item.id}>
          {item.name}
        </SelectItem>
      );
    });
  }, [gatesData?.data.data]);

  const parkingAreaSelects = useMemo(() => {
    const parkingAreas = parkingAreasData?.data.data;
    if (!parkingAreas) return [];

    return parkingAreas.map((item) => {
      return (
        <SelectItem key={item.id} value={item.id}>
          {item.name}
        </SelectItem>
      );
    });
  }, [parkingAreasData?.data.data]);

  const handleGateChange = (value: string) => {
    setSelectedGateId(value);
  };

  const handleConfirmGate = async () => {
    try {
      const gates = gatesData?.data.data;
      if (!gates) return;

      if (gates.length === 0) return;

      const currentGate = gates.find((item) => item.id === selectedGateId);
      if (!currentGate) {
        return;
      }

      const gateType = currentGate.gateType;

      window.ipcRenderer.send(SET_GATE_CHANNEL, {
        id: selectedGateId,
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
          <h3>Select Gate</h3>
        </div>
        <div className='grid w-1/4 h-full grid-rows-3 gap-3'>
          <div className='grid grid-rows-[1fr_auto]'>
            <p className='mb-1'>Bãi giữ xe</p>
            <Select
              onValueChange={handleParkingAreaIdChange}
              disabled={isLoadingGates}
            >
              <SelectTrigger className='min-w-full'>
                <SelectValue placeholder='Chọn Bãi giữ xe' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>{parkingAreaSelects}</SelectGroup>
              </SelectContent>
            </Select>
            <div className='grid'>
              {!selectedParkingId && (
                <p className='text-destructive'>Hãy chọn bãi giữ xe </p>
              )}
            </div>
          </div>
          <div className='grid'>
            <p className='mb-1'>Cổng</p>
            <Select
              onValueChange={handleGateChange}
              disabled={isLoadingGates || selectedParkingId === ""}
            >
              <SelectTrigger className='min-w-full'>
                <SelectValue
                  placeholder={isLoadingGates ? "Loading..." : "Chọn cổng"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>{gateSelects}</SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className='grid grid-cols-2 gap-1'>
            <Button variant='destructive'>Hủy</Button>
            <Button
              disabled={selectedGateId === ""}
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
