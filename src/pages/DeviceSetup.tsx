import SetUpCameraLane from "@components/CameraSection/SetUpCameraLane";
import LaneContainer from "@components/LaneContainer";
import ParkingContainer from "@components/ParkingContainer";
import { Label } from "@components/ui/label";
import { Switch } from "@components/ui/switch";
import LANE from "@constants/lane.const";
import { useEffect, useState } from "react";
import useRefresh from "../hooks/useRefresh";
import { SET_IS_2_LANE_CHANNEL } from "@channels/index";
import useGet2Lane from "../hooks/useGet2Lane";

export default function DeviceSetupPage() {
  const isSetting2Lane = useGet2Lane();
  const [is2Lane, setIs2Lane] = useState(false);

  useRefresh();
  useEffect(() => {
    setIs2Lane(isSetting2Lane);
  }, [isSetting2Lane]);

  const handleToggle2Lane = (value: boolean) => {
    setIs2Lane(value);

    window.ipcRenderer.send(SET_IS_2_LANE_CHANNEL, value);
  };

  return (
    <div className='flex flex-col items-start justify-center w-full p-4'>
      <div className='flex items-center justify-center h-32 min-w-full text-center'>
        <h2 className='text-4xl font-bold'>Cài đặt Camera</h2>
      </div>
      <div className='flex justify-start w-full gap-3 p-2 mb-3 border'>
        <div className='w-fit'>
          <Label>Chế độ Cổng</Label>
          <div className='flex items-center gap-2'>
            <Switch
              id='2-lane-mode'
              onCheckedChange={handleToggle2Lane}
              checked={is2Lane}
            />
            <Label htmlFor='2-lane-mode'>2 Làn</Label>
          </div>
        </div>
      </div>
      <LaneContainer is2Lane={is2Lane}>
        <div>
          <Label>Làn trái</Label>
          <ParkingContainer>
            <SetUpCameraLane laneKey={LANE.LEFT} />
          </ParkingContainer>
        </div>
        {is2Lane && (
          <div>
            <Label>Làn phải</Label>
            <ParkingContainer>
              <SetUpCameraLane laneKey={LANE.RIGHT} />
            </ParkingContainer>
          </div>
        )}
      </LaneContainer>
    </div>
  );
}
