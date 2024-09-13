import { SelectOptions } from "@components/Form/FormSelect";
import { Label } from "@components/ui/label";
import { RadioGroup, RadioGroupItem } from "@components/ui/radio-group";
import { GATE_IN, GATE_OUT } from "@constants/gate.const";
import { useCallback, useEffect, useMemo, useState } from "react";
import useGetLaneMode from "../../hooks/useGetLaneMode";
import { SET_LEFT_LANE_CHANNEL, SET_RIGHT_LANE_CHANNEL } from "@channels/index";
import LANE from "@constants/lane.const";
import { GateType } from "@my_types/gate";

interface Props {
  is2Lane: boolean;
}

const LaneRadioItems: SelectOptions[] = [
  {
    value: GATE_IN,
    name: "Làn vào",
  },
  {
    value: GATE_OUT,
    name: "Làn ra",
  },
];
export default function LaneRadioGroup({ is2Lane }: Props) {
  const leftLaneMode = useGetLaneMode(LANE.LEFT);
  const rightLaneMode = useGetLaneMode(LANE.RIGHT);
  const [laneMode, setLaneMode] = useState({
    left: leftLaneMode,
    right: rightLaneMode,
  });

  useEffect(() => {
    setLaneMode((prev) => ({
      ...prev,
      left: leftLaneMode,
      right: rightLaneMode,
    }));
  }, [leftLaneMode, rightLaneMode]);

  const radioItems = useMemo(() => {
    return LaneRadioItems.map((item) => (
      <div className='flex items-center space-x-2' key={item.value}>
        <RadioGroupItem value={item.value} id={item.name} />
        <Label htmlFor={item.name}>{item.name}</Label>
      </div>
    ));
  }, [LaneRadioItems]);

  const handleSetLeftLaneMode = useCallback((mode: string) => {
    setLaneMode((prev) => ({ ...prev, left: mode as GateType }));
    window.ipcRenderer.send(SET_LEFT_LANE_CHANNEL, mode);
  }, []);

  const handleSetRightLaneMode = useCallback((mode: string) => {
    setLaneMode((prev) => ({ ...prev, right: mode as GateType }));
    window.ipcRenderer.send(SET_RIGHT_LANE_CHANNEL, mode);
  }, []);

  return (
    <div className='flex gap-4'>
      <div className='flex flex-col items-start justify-center gap-2'>
        <Label>Làn trái</Label>
        <RadioGroup value={laneMode.left} onValueChange={handleSetLeftLaneMode}>
          {radioItems}
        </RadioGroup>
      </div>
      {is2Lane && (
        <div className='flex flex-col items-start justify-center gap-2'>
          <Label>Làn phải</Label>
          <RadioGroup
            value={laneMode.right}
            onValueChange={handleSetRightLaneMode}
          >
            {radioItems}
          </RadioGroup>
        </div>
      )}
    </div>
  );
}
