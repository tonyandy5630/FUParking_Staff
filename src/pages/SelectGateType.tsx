import { getGateByParkingAreaIdAPI } from "@apis/gate.api";
import { getAllParkingAreaAPI } from "@apis/parking-area.api";
import {
  GET_GATE_ID_CHANNEL,
  GET_NOT_FIRST_TIME_CHANNEL,
  GET_PARKING_AREA_ID_CHANNEL,
  SET_GATE_CHANNEL,
  SET_NOT_FIRST_TIME_CHANNEL,
  SET_PARKING_AREA_ID_CHANNEL,
} from "@channels/index";
import { Button } from "@components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PAGE from "../../url";
import { VIRTUAL } from "@constants/gate.const";
import { Gate } from "@my_types/gate";
import useGetParkingId from "../hooks/useGetParkingId";
import useSelectGate from "../hooks/useSelectGate";
import ToggleButton from "@components/Button/ToggleButton";
import ToggleButtonContainer from "@components/ToggleButtonContainer";
import { Skeleton } from "@components/ui/skeleton";
import { useAppDispatch, useAppSelector } from "@utils/store";
import useRefresh from "../hooks/useRefresh";
const ConfirmDialog = lazy(() => import("../ConfirmDialog"));
import useGetLogin from "../hooks/useGetLogIn";
import VerificationFallback from "@components/Fallback/VerificationFallback";
import { setNewTable, setSessionTableItem } from "../redux/sessionSlice";
const LoginButton = lazy(() => import("@components/LoginButton"));

export default function SelectGateTypePage() {
  useRefresh();
  useSelectGate();
  const isLoggedIn = useGetLogin();
  const { parkingId, isLoadingParkingAreaData: verifyingParking } =
    useGetParkingId();
  const [openConfirm, setOpenConfirm] = useState(false);
  const gateInId = useAppSelector((state) => state.gate);
  const [selectedParkingId, setSelectedParkingId] = useState<string>("");
  const [selectedGateId, setSelectedGateId] = useState<string>("");
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

  const handleGateChange = (value: string) => {
    if (value === selectedGateId) {
      setSelectedGateId("");
      return;
    }
    setSelectedGateId(value);
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
    setSelectedGateId(gateInId);
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
      setSelectedGateId(gateInId);
    }

    setAllGates([...allGates]);
  }, [gatesData?.data.data]);

  const gateSelects = useMemo(() => {
    if (!allGates || allGates.length === 0) {
      return <p className='text-destructive'>Không có cổng</p>;
    }

    return allGates.map((item) => (
      <ToggleButton
        key={item.id}
        value={item.id}
        currentValue={selectedGateId}
        onToggleClick={handleGateChange}
      >
        {item.name}
      </ToggleButton>
    ));
  }, [gateInId, setSelectedGateId, selectedGateId, allGates]);

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
      if (!allGates) return;

      if (allGates.length === 0) return;

      if (selectedGateId === "") {
        return;
      }

      const shouldSetGateIn = selectedGateId !== "";

      if (shouldSetGateIn) {
        window.ipcRenderer.send(SET_GATE_CHANNEL, selectedGateId);
      }

      window.ipcRenderer.send(SET_PARKING_AREA_ID_CHANNEL, selectedParkingId);

      const newParkingAreaId = await window.ipcRenderer.invoke(
        GET_PARKING_AREA_ID_CHANNEL
      );

      let gateId: string | undefined;

      if (shouldSetGateIn) {
        gateId = await window.ipcRenderer.invoke(GET_GATE_ID_CHANNEL);
      }

      if (shouldSetGateIn && gateId === "") {
        toast.error("Failed to retrieve gate in");
        window.ipcRenderer.send(SET_NOT_FIRST_TIME_CHANNEL, false);
        return;
      }

      if (!newParkingAreaId) {
        toast.error("Failed to retrieve new parking area");
        window.ipcRenderer.send(SET_NOT_FIRST_TIME_CHANNEL, false);
        return;
      }

      const notFirstTimeSetup = await window.ipcRenderer.invoke(
        GET_NOT_FIRST_TIME_CHANNEL
      );
      //* set up camera if is first time set up
      if (!notFirstTimeSetup) {
        navigate(PAGE.DEVICE_SET_UP);
        return;
      }

      navigate(PAGE.GATE);

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
      {verifyingParking ? (
        <VerificationFallback />
      ) : (
        <>
          <div className='w-full p-3'>{!isLoggedIn && <LoginButton />}</div>
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
                <ToggleButtonContainer label='Cổng' isLoading={isLoadingGates}>
                  {gateSelects}
                </ToggleButtonContainer>
              </div>
              <div className='grid grid-cols-2 gap-1'>
                <Button
                  className='rounded-sm'
                  variant='destructive'
                  onClick={() => handleResetSetup()}
                  disabled={selectedGateId === ""}
                >
                  Hủy
                </Button>
                <Button
                  className='rounded-sm'
                  disabled={selectedGateId === ""}
                  onClick={handleOpenConfirm}
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </main>{" "}
        </>
      )}
    </>
  );
}
