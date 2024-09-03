import { getGateByParkingAreaIdAPI } from "@apis/gate.api";
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
import { Button } from "@components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PAGE from "../../url";
import { GATE_IN, GATE_OUT, VIRTUAL } from "@constants/gate.const";
import { GateType } from "@my_types/gate";
import useGetParkingId from "../hooks/useGetParkingId";
import { SelectOptions } from "@components/Form/FormSelect";
import useSelectGate from "../hooks/useSelectGate";
import ToggleButton from "@components/Button/ToggleButton";
import ToggleButtonContainer from "@components/ToggleButtonContainer";
import { Skeleton } from "@components/ui/skeleton";
const ConfirmDialog = lazy(() => import("../ConfirmDialog"));

export default function SelectGateTypePage() {
  const parkingId = useGetParkingId();
  const [openConfirm, setOpenConfirm] = useState(false);
  const { gateId: gateInId } = useSelectGate(GATE_IN);
  const { gateId: gateOutId } = useSelectGate(GATE_OUT);
  const [selectedParkingId, setSelectedParkingId] = useState<string>("");
  const [selectedGateInId, setSelectedGateInId] = useState<string>("");
  const [selectedGateOutId, setSelectedGateOutId] = useState<string>("");
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

  const handleGateInChange = (value: string) => {
    setSelectedGateInId(value);
  };

  const handleGateOutChange = (value: string) => {
    setSelectedGateOutId(value);
  };

  useEffect(() => {
    if (parkingId !== "") setSelectedParkingId(parkingId);
  }, [parkingId]);

  const handleParkingAreaIdChange = (value: string) => {
    setSelectedParkingId((prev) => value);

    //* Reset gate on change parking area
    handleResetGates();
  };

  const handleOpenConfirm = () => {
    setOpenConfirm((prev) => !prev);
  };

  const handleResetGates = () => {
    setSelectedGateInId("");
    setSelectedGateOutId("");
  };

  const allGateOptions = useCallback(
    (gateType: GateType): SelectOptions[] => {
      const gates = gatesData?.data.data;

      if (!gates) {
        return [];
      }

      return gates
        .filter((item) => item.gateType === gateType)
        .map((item) => {
          return {
            name: item.name,
            value: item.id,
          };
        });
    },
    [gatesData?.data.data]
  );

  const gateInSelects = useMemo(() => {
    const gates = allGateOptions(GATE_IN);

    if (!gates || gates.length === 0) {
      return <p className='text-destructive'>Không có cổng</p>;
    }

    const systemSelectedGate = gates.find((item) => item.value === gateInId);
    if (systemSelectedGate) setSelectedGateInId(systemSelectedGate.value);

    const currentValue = systemSelectedGate
      ? systemSelectedGate.value
      : selectedGateOutId;
    return gates.map((item) => (
      <ToggleButton
        key={item.value}
        value={item.value}
        currentValue={currentValue}
        onToggleClick={handleGateInChange}
      >
        {item.name}
      </ToggleButton>
    ));
  }, [allGateOptions, gateInId, setSelectedGateInId, selectedGateInId]);

  const gateOutSelects = useMemo(() => {
    const gates = allGateOptions(GATE_OUT);

    if (!gates || gates.length === 0) {
      return <p className='text-destructive'>Không có cổng</p>;
    }

    const systemSelectedGate = gates.find((item) => item.value === gateOutId);
    if (systemSelectedGate) setSelectedGateInId(systemSelectedGate.value);

    const currentValue = systemSelectedGate
      ? systemSelectedGate.value
      : selectedGateOutId;
    return gates.map((item) => (
      <ToggleButton
        key={item.value}
        value={item.value}
        currentValue={currentValue}
        onToggleClick={handleGateOutChange}
      >
        {item.name}
      </ToggleButton>
    ));
  }, [allGateOptions, gateOutId, selectedGateOutId, setSelectedGateOutId]);

  const parkingAreaSelects = useMemo(() => {
    const parkingAreas = parkingAreasData?.data.data;
    if (!parkingAreas) return <p className='text-destructive'>Không có bãi</p>;

    //* cannot change parking area if selected before
    const shouldDisabled = parkingId !== "";

    return parkingAreas
      .filter((item) => item.name !== VIRTUAL)
      .map((item) => {
        return (
          <ToggleButton
            disabled={shouldDisabled}
            value={item.id}
            key={item.id}
            currentValue={selectedParkingId}
            onToggleClick={handleParkingAreaIdChange}
          >
            {item.name}
          </ToggleButton>
        );
      });
  }, [
    parkingAreasData?.data.data,
    parkingId,
    setSelectedParkingId,
    selectedParkingId,
  ]);

  const handleConfirmGate = async () => {
    try {
      const gates = gatesData?.data.data;
      if (!gates) return;

      if (gates.length === 0) return;

      if (selectedGateInId === "" && selectedGateOutId === "") {
        return;
      }

      const shouldSetGateIn = selectedGateInId !== "";
      const shouldSetGateOut = selectedGateOutId !== "";

      if (shouldSetGateIn) {
        window.ipcRenderer.send(SET_GATE_CHANNEL, {
          id: selectedGateInId,
          type: GATE_IN,
        });
      }

      if (shouldSetGateOut) {
        window.ipcRenderer.send(SET_GATE_CHANNEL, {
          id: selectedGateOutId,
          type: GATE_OUT,
        });
      }

      window.ipcRenderer.send(SET_PARKING_AREA_ID_CHANNEL, selectedParkingId);

      const newParkingAreaId = await window.ipcRenderer.invoke(
        GET_PARKING_AREA_ID_CHANNEL
      );

      const newGateType = await window.ipcRenderer.invoke(
        GET_GATE_TYPE_CHANNEL
      );

      await Promise.all([newGateType, newParkingAreaId]);

      let gateInId: string | undefined;
      let gateOutId: string | undefined;

      if (shouldSetGateIn) {
        gateInId = await window.ipcRenderer.invoke(GET_GATE_IN_ID_CHANNEL);
      }

      if (shouldSetGateOut) {
        gateOutId = await window.ipcRenderer.invoke(GET_GATE_OUT_ID_CHANNEL);
      }

      if (shouldSetGateIn && gateInId === "") {
        toast.error("Failed to retrieve gate in");
        window.ipcRenderer.send(SET_NOT_FIRST_TIME_CHANNEL, false);
        return;
      }

      if (shouldSetGateOut && gateOutId === "") {
        toast.error("Failed to retrieve gate out");
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
      {openConfirm && (
        <Suspense fallback={<Skeleton className='w-40 h-30' />}>
          <ConfirmDialog
            open={openConfirm}
            onOpenChange={handleOpenConfirm}
            onConfirmSubmit={handleConfirmGate}
            title='Xác nhận cổng'
          />
        </Suspense>
      )}
      <main className='flex flex-col items-center justify-center min-h-full gap-y-10 min-w-screen'>
        <div className='flex items-center justify-center min-w-full p-3 text-4xl font-bold'>
          <h3 className='uppercase '>Cài đặt cổng</h3>
        </div>
        <div className='grid h-full gap-3 min-w-1/4'>
          <ToggleButtonContainer
            label='Bãi giữ xe'
            isLoading={isLoadingParkingArea}
          >
            {parkingAreaSelects}
          </ToggleButtonContainer>
          <div className='grid gap-2'>
            <ToggleButtonContainer label='Cổng vào' isLoading={isLoadingGates}>
              {gateInSelects}
            </ToggleButtonContainer>
            <ToggleButtonContainer label='Cổng ra' isLoading={isLoadingGates}>
              {gateOutSelects}
            </ToggleButtonContainer>
          </div>
          <div className='grid grid-cols-2 gap-1'>
            <Button className='rounded-sm' variant='destructive'>
              Hủy
            </Button>
            <Button
              className='rounded-sm'
              disabled={selectedGateInId === "" && selectedGateOutId === ""}
              onClick={handleOpenConfirm}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
