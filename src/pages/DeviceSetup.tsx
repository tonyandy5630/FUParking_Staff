import SetUpCameraLane from "@components/CameraSection/SetUpCameraLane";
import LaneContainer from "@components/LaneContainer";
import ParkingContainer from "@components/ParkingContainer";
import LANE from "@constants/lane.const";
import { useCallback, useEffect, useRef, useState } from "react";

export default function DeviceSetupPage() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const is2Lane = useRef<boolean>(false);

  const handleDevices = useCallback(
    (mediaDevices: MediaDeviceInfo[]) => {
      const videoInputs = mediaDevices.filter(
        ({ kind }: MediaDeviceInfo) => kind === "videoinput"
      );
      setDevices(videoInputs);
      if (videoInputs.length >= 4) is2Lane.current = true;
    },
    [setDevices]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
    // Add event listener when component mounts
  }, [handleDevices, devices.length]);

  return (
    <div className='w-full min-w-full'>
      <div className='flex items-center justify-center h-32 min-w-full text-center'>
        <h2 className='text-4xl font-bold'>Cài đặt camera</h2>
      </div>
      <LaneContainer is2Lane={is2Lane.current}>
        <ParkingContainer>
          <SetUpCameraLane laneKey={LANE.LEFT} />
          {is2Lane.current && <SetUpCameraLane laneKey={LANE.RIGHT} />}
        </ParkingContainer>
      </LaneContainer>
    </div>
  );
}
