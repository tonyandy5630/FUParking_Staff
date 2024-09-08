import { getGateByParkingAreaIdAPI } from "@apis/gate.api";
import { getAllParkingAreaAPI } from "@apis/parking-area.api";
import {
  GET_GATE_IN_ID_CHANNEL,
  GET_GATE_OUT_ID_CHANNEL,
  GET_GATE_TYPE_CHANNEL,
  GET_NOT_FIRST_TIME_CHANNEL,
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
import { Gate, GateType } from "@my_types/gate";
import useGetParkingId from "../hooks/useGetParkingId";
import { SelectOptions } from "@components/Form/FormSelect";
import useSelectGate from "../hooks/useSelectGate";
import ToggleButton from "@components/Button/ToggleButton";
import ToggleButtonContainer from "@components/ToggleButtonContainer";
import { Skeleton } from "@components/ui/skeleton";
import { useAppSelector } from "@utils/store";
import useRefresh from "../hooks/useRefresh";
const ConfirmDialog = lazy(() => import("../ConfirmDialog"));

export default function SelectGateTypePage() {
  useRefresh();
  const parkingId = useGetParkingId();
  const [openConfirm, setOpenConfirm] = useState(false);
  useSelectGate(GATE_IN);
  useSelectGate(GATE_OUT);
  const gateInId = useAppSelector((state) => state.gateIn);
  const gateOutId = useAppSelector((state) => state.gateOut);
  const [selectedParkingId, setSelectedParkingId] = useState<string>("");
  const [selectedGateInId, setSelectedGateInId] = useState<string>("");
  const [selectedGateOutId, setSelectedGateOutId] = useState<string>("");
  const [allGates, setAllGates] = useState<Gate[]>([]);
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
    if (value === selectedGateInId) {
      setSelectedGateInId("");
      return;
    }
    setSelectedGateInId(value);
  };

  const handleGateOutChange = (value: string) => {
    if (value === selectedGateOutId) {
      setSelectedGateOutId("");
      return;
    }
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
    setSelectedGateInId(gateInId);
    setSelectedGateOutId(gateOutId);
  };

  const handleResetSetup = () => {
    setSelectedParkingId(parkingId);
    handleResetGates();
  };

  useEffect(() => {
    const allGates = gatesData?.data.data;
    if (!allGates) {
      return;
    }

    const selectedIn = allGates.find((item) => item.id === gateInId);
    if (selectedIn) {
      setSelectedGateInId(gateInId);
    }
    const selectedOut = allGates.find((item) => item.id === gateOutId);
    if (selectedOut) {
      setSelectedGateOutId(gateOutId);
    }

    setAllGates([...allGates]);
  }, [gatesData?.data.data]);

  const allGateOptions = useCallback(
    (gateType: GateType): SelectOptions[] => {
      if (!allGates) {
        return [];
      }

      return allGates
        .filter((item) => item.gateType === gateType)
        .map((item) => {
          return {
            name: item.name,
            value: item.id,
          };
        });
    },
    [allGates]
  );

  const gateInSelects = useMemo(() => {
    const gates = allGateOptions(GATE_IN);
    if (!gates || gates.length === 0) {
      return <p className='text-destructive'>Không có cổng</p>;
    }

    return gates.map((item) => (
      <ToggleButton
        key={item.value}
        value={item.value}
        currentValue={selectedGateInId}
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

    return gates.map((item) => (
      <ToggleButton
        key={item.value}
        value={item.value}
        currentValue={selectedGateOutId}
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

      // window.ipcRenderer.send(SET_NOT_FIRST_TIME_CHANNEL, true);

      //* successfully validate
      if (newGateType === GATE_IN || newGateType === GATE_OUT) {
        window.ipcRenderer.send(LOGGED_IN, true);
      }

      const notFirstTimeSetup = await window.ipcRenderer.invoke(
        GET_NOT_FIRST_TIME_CHANNEL
      );

      if (!notFirstTimeSetup) {
        navigate(PAGE.DEVICE_SET_UP);
      }

      return;
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
            text='Bấm xác nhận bạn sẽ không thể đổi lại bãi giữ xe trong tương lai'
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
            <Button
              className='rounded-sm'
              variant='destructive'
              onClick={() => handleResetSetup()}
              disabled={selectedGateInId === "" || selectedGateOutId === ""}
            >
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
