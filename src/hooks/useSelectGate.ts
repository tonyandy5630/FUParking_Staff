import { GET_GATE_ID_CHANNEL } from "@channels/index";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PAGE from "../../url";
import { useAppDispatch } from "@utils/store";
import { setGateId as setSystemGateId } from "../redux/gateSlice";

/**
 *  Getting the gateId that selected in the settings
 * @param shouldNavigate default is **false**, optional-to decide whether redirect if not getting gateId
 * @returns gateId
 */
export default function useSelectGate(shouldNavigate?: boolean) {
  const [gateId, setGateId] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    window.ipcRenderer
      .invoke(GET_GATE_ID_CHANNEL)
      .then((res) => {
        if (!res || res.length === 0) {
          if (shouldNavigate) navigate(PAGE.SELECT_GATE_TYPE);
        }
        setGateId(res);
        dispatch(setSystemGateId(res));
      })
      .catch(() => {
        navigate("/");
      });
  }, []);

  return gateId;
}
