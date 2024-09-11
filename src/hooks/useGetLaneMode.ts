import { GET_LEFT_LANE_CHANNEL, GET_RIGHT_LANE_CHANNEL } from "@channels/index";
import { GATE_IN } from "@constants/gate.const";
import LANE from "@constants/lane.const";
import { GateType } from "@my_types/gate";
import LanePosition from "@my_types/lane";
import { useEffect, useState } from "react";

export default function useGetLaneMode(lane: LanePosition) {
  const [laneMode, setLaneMode] = useState<GateType>(GATE_IN);

  useEffect(() => {
    if (lane === LANE.LEFT) {
      window.ipcRenderer
        .invoke(GET_LEFT_LANE_CHANNEL)
        .then((res) => {
          setLaneMode(res);
        })
        .catch((err) => console.log(err));
    } else if (lane === LANE.RIGHT) {
      window.ipcRenderer
        .invoke(GET_RIGHT_LANE_CHANNEL)
        .then((res) => {
          setLaneMode(res);
        })
        .catch((err) => console.log(err));
    }
  }, [lane]);

  return laneMode;
}
