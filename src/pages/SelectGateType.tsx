import { getAllGateAPI } from "@apis/gate.api";
import { getAllParkingAreaAPI } from "@apis/parking-area.api";
import {
  GET_GATE_ID_CHANNEL,
  GET_GATE_TYPE_CHANNEL,
  SET_GATE_CHANNEL,
} from "@channels/index";
import MyButton from "@components/Button";
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
import { ipcRenderer } from "electron";
import React, { useMemo, useState } from "react";
import { FormProvider } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PAGE from "../../url";

export default function SelectGateTypePage() {
  const [selectedParkingName, setSelectedParkingName] = useState("");
  const [selectedGateId, setSelectedGate] = useState("");
  const navigate = useNavigate();
  const {
    data: gatesData,
    isLoading: isLoadingGates,
    isSuccess: isSuccessGate,
  } = useQuery({
    queryKey: ["/gate-all"],
    queryFn: () => getAllGateAPI(selectedParkingName),
    enabled: selectedParkingName !== "",
  });

  const { data: parkingAreasData, isLoading: isLoadingParkingArea } = useQuery({
    queryKey: ["/parking-areas-options"],
    queryFn: getAllParkingAreaAPI,
  });

  const handleParkingAreaNameChange = (value: string) => {
    setSelectedParkingName(value);
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
  }, []);

  const parkingAreaSelects = useMemo(() => {
    const parkingAreas = parkingAreasData?.data.data;
    if (!parkingAreas) return [];

    return parkingAreas.map((item) => {
      return (
        <SelectItem key={item.id} value={item.name}>
          {item.name}
        </SelectItem>
      );
    });
  }, [parkingAreasData?.data.data]);

  const handleGateChange = (value: string) => {
    setSelectedGate(value);
  };

  const handleConfirmGate = async () => {
    try {
      const gates = gatesData?.data.data;
      if (!gates) return;
      const gateType = gates?.find((item) => item.id === selectedGateId)
        ?.gateType.name;
      window.ipcRenderer.send(SET_GATE_CHANNEL, {
        id: selectedGateId,
        type: gateType,
      });

      const gateId = await window.ipcRenderer.invoke(GET_GATE_ID_CHANNEL);
      const newGateType = await window.ipcRenderer.invoke(
        GET_GATE_TYPE_CHANNEL
      );
      if (gateId && newGateType) toast.success("Set gate successfully");

      if (newGateType === "IN") {
        navigate(PAGE.CHECK_IN);
      } else if (newGateType === "OUT") {
        navigate(PAGE.CHECK_OUT);
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
        <div className='grid w-1/4 h-full grid-cols-2 gap-y-3 '>
          <FormItem>
            <Select onValueChange={handleParkingAreaNameChange}>
              <SelectTrigger className='min-w-full'>
                <SelectValue placeholder='Chọn Bãi giữ xe' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>{parkingAreaSelects}</SelectGroup>
              </SelectContent>
            </Select>
          </FormItem>
          <FormItem>
            {selectedParkingName ? (
              <p>
                Chọn cổng của bãi xe: <strong>{selectedParkingName}</strong>
              </p>
            ) : (
              <p className='text-destructive'>Hãy chọn cổng </p>
            )}
          </FormItem>
          <FormItem>
            <Select onValueChange={handleGateChange}>
              <SelectTrigger className='min-w-full'>
                <SelectValue placeholder='Chọn cổng' />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>{gateSelects}</SelectGroup>
              </SelectContent>
            </Select>
          </FormItem>
          <FormItem className='grid-cols-2 gap-1'>
            <Button variant='destructive'>Hủy</Button>
            <Button onClick={() => handleConfirmGate()}>Xác nhận</Button>
          </FormItem>
        </div>
      </main>
    </>
  );
}
