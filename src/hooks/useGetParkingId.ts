import { GET_PARKING_AREA_ID_CHANNEL } from "@channels/index";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PAGE from "../../url";

export default function useGetParkingId(shouldNavigate?: boolean) {
  const [parkingId, setParkingId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    window.ipcRenderer
      .invoke(GET_PARKING_AREA_ID_CHANNEL)
      .then((res) => {
        if (!res || res.length === 0) {
          if (shouldNavigate) navigate(PAGE.SELECT_GATE_TYPE);
        }
        setParkingId(res);
      })
      .catch((error) => {
        navigate(PAGE.SELECT_GATE_TYPE);
      });
  }, []);

  return parkingId;
}
