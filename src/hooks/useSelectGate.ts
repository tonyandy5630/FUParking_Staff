import { GET_GATE_ID_CHANNEL, SET_GATE_CHANNEL } from "@channels/index";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PAGE from "../../url";
import { useAppDispatch } from "@utils/store";
import { setGateId as setSystemGateId } from "../redux/gateSlice";
import { useQuery } from "@tanstack/react-query";
import { getGateByGateidAPI } from "@apis/gate.api";
import { AxiosError, HttpStatusCode } from "axios";

/**
 *  Getting the gateId that selected in the settings
 * @param shouldNavigate default is **false**, optional-to decide whether redirect if not getting gateId
 * @returns gateId
 */
export default function useSelectGate(shouldNavigate?: boolean) {
  const [gateId, setGateId] = useState("");
  const triggerValidate = useRef(false);
  const [verifying, setVerifying] = useState(true);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    isError: isErrorGateData,
    error,
    isLoading: isLoadingGateData,
  } = useQuery({
    queryKey: ["validate-gate"],
    queryFn: () => getGateByGateidAPI(gateId),
    enabled: triggerValidate.current,
    retry: 1,
  });

  useEffect(() => {
    if (!triggerValidate.current) {
      return;
    }
    if (isLoadingGateData) {
      return;
    }

    //* validate success
    if (!isErrorGateData) {
      setVerifying(false);
      triggerValidate.current = false;
      return;
    }
    //* error occurred
    const errorGateData = error as AxiosError;
    if (!errorGateData?.response) {
      navigate("/");
      setVerifying(false);
      triggerValidate.current = false;
      return;
    }

    //* handle gate is deleted
    if (errorGateData.response.status === HttpStatusCode.NotFound) {
      setGateId("");
      dispatch(setSystemGateId(""));
      if (shouldNavigate) {
        window.ipcRenderer.send(SET_GATE_CHANNEL, "");
        navigate(PAGE.SELECT_GATE_TYPE);
        triggerValidate.current = false;
        return;
      }
      setVerifying(false);
      triggerValidate.current = false;
      return;
    }
    triggerValidate.current = false;
    setVerifying(false);
  }, [
    gateId,
    triggerValidate.current,
    isErrorGateData,
    setVerifying,
    isLoadingGateData,
  ]);

  useEffect(() => {
    window.ipcRenderer
      .invoke(GET_GATE_ID_CHANNEL)
      .then((res) => {
        if (!res || res.length === 0) {
          if (shouldNavigate) navigate(PAGE.SELECT_GATE_TYPE);
        }
        setGateId(res);
        triggerValidate.current = true;
        dispatch(setSystemGateId(res));
      })
      .catch(() => {
        navigate("/");
      });
  }, []);

  return { gateId, isLoadingGateData: verifying, isErrorGateData };
}
