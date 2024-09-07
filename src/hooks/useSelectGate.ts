import {
  GET_GATE_IN_ID_CHANNEL,
  GET_GATE_OUT_ID_CHANNEL,
} from "@channels/index";
import { GATE_IN, GATE_OUT } from "@constants/gate.const";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PAGE from "../../url";
import { useAppDispatch } from "@utils/store";
import { setGateInId, setGateOutId } from "../redux/gateSlice";

/**
 *  Getting the gateId that type being passed to
 * @param gateType
 * @param shouldNavigate default is **false**, optional-to decide whether redirect if not getting gateId
 * @returns gateId
 */
export default function useSelectGate(
  gateType: string,
  shouldNavigate?: boolean
) {
  const [gateId, setGateId] = useState("");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    switch (gateType) {
      case GATE_IN:
        window.ipcRenderer.invoke(GET_GATE_IN_ID_CHANNEL).then((res) => {
          if (!res || res.length === 0) {
            if (shouldNavigate) navigate(PAGE.SELECT_GATE_TYPE);
          }
          setGateId(res);
          dispatch(setGateInId(res));
        });
        break;
      case GATE_OUT:
        window.ipcRenderer.invoke(GET_GATE_OUT_ID_CHANNEL).then((res) => {
          if (!res || res.length === 0) {
            if (shouldNavigate) navigate(PAGE.SELECT_GATE_TYPE);
          }
          setGateId(res);
          dispatch(setGateOutId(res));
        });
        break;
      default:
        navigate("/");
    }
  }, [gateType]);

  return {
    gateId,
  };
}
