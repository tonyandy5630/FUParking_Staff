import { useCallback, useEffect, useRef, useState } from "react";
import CheckInSection from "@components/CheckInSection";
import LaneContainer from "@components/LaneContainer";
export default function CheckInPage() {
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
  }, [handleDevices, devices.length]);

  return (
    <>
      {devices.length !== 0 && (
        <div className={`flex w-full min-h-full`}>
          {devices[0] !== undefined && (
            <LaneContainer is2Lane={is2Lane.current}>
              <CheckInSection
                key={devices[0].deviceId}
                bodyDeviceId={devices[1].deviceId}
                plateDeviceId={devices[0].deviceId}
                cameraSize='md'
              >
                Lane 1
              </CheckInSection>
            </LaneContainer>
          )}
        </div>
      )}
    </>
  );
}
