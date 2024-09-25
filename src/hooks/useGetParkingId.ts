import {
  GET_PARKING_AREA_ID_CHANNEL,
  SET_PARKING_AREA_ID_CHANNEL,
} from "@channels/index";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PAGE from "../../url";
import { useQuery } from "@tanstack/react-query";
import { getParkingAreaById } from "@apis/parking-area.api";
import { AxiosError, HttpStatusCode } from "axios";

export default function useGetParkingId(shouldNavigate?: boolean) {
  const [parkingId, setParkingId] = useState("");
  const triggerQuery = useRef(true);
  const [verifying, setVerifying] = useState(true);
  const navigate = useNavigate();
  const {
    isError: isErrorParkingAreaData,
    isLoading: isLoadingParkingAreaData,
    error,
  } = useQuery({
    queryKey: ["validate-parking-area"],
    queryFn: () => getParkingAreaById(parkingId),
    enabled: triggerQuery.current,
  });

  useEffect(() => {
    if (!triggerQuery.current) {
      return;
    }

    if (isLoadingParkingAreaData) {
      return;
    }

    //* validate success
    if (!isErrorParkingAreaData) {
      setVerifying(false);
      triggerQuery.current = false;
      return;
    }
    //* error occurred
    const errorParkingData = error as AxiosError;
    if (!errorParkingData?.response) {
      navigate("/");
      setVerifying(false);
      triggerQuery.current = false;
      return;
    }

    //* handle gate is deleted
    if (errorParkingData.response.status === HttpStatusCode.NotFound) {
      setParkingId("");
      window.ipcRenderer.send(SET_PARKING_AREA_ID_CHANNEL, "");
      if (shouldNavigate) {
        navigate(PAGE.SELECT_GATE_TYPE);
        triggerQuery.current = false;
        return;
      }
      setVerifying(false);
      triggerQuery.current = false;
      return;
    }
    triggerQuery.current = false;
    setVerifying(false);
  }, [
    parkingId,
    triggerQuery.current,
    isErrorParkingAreaData,
    setVerifying,
    isLoadingParkingAreaData,
  ]);

  useEffect(() => {
    window.ipcRenderer
      .invoke(GET_PARKING_AREA_ID_CHANNEL)
      .then((res) => {
        if (!res || res.length === 0) {
          if (shouldNavigate) {
            navigate(PAGE.SELECT_GATE_TYPE);
          }
          setVerifying(false);
          return;
        }
        setParkingId(res);
        triggerQuery.current = true;
      })
      .catch((error) => {
        navigate(PAGE.SELECT_GATE_TYPE);
      });
  }, []);

  return {
    parkingId,
    isLoadingParkingAreaData: verifying,
    errorParkingAreaData: isErrorParkingAreaData,
  };
}
