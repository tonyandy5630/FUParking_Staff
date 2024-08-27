import CheckOutSection from "@components/CheckOutSection";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LANE from "@constants/lane.const";

export default function CheckOutPage() {
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
    <>
      {devices.length !== 0 && (
        <div className='flex w-full min-h-full'>
          {devices[0] !== undefined && (
            <div
              className={`grid min-w-full ${
                is2Lane.current
                  ? "grid-cols-2 justify-items-stretch"
                  : "grid-cols-1 justify-items-center"
              } pt-1 space-x-1 `}
            >
              <CheckOutSection
                key={devices[0].deviceId}
                plateDeviceId={devices[0].deviceId}
                bodyDeviceId={devices[1].deviceId}
                cameraSize='sm'
                position={LANE.LEFT}
              >
                Lane 1
              </CheckOutSection>
              {/* <HotkeysProvider
                initiallyActiveScopes={[LANE.RIGHT]}
                key={LANE.RIGHT}
              >
                <CheckOutSection
                  key={devices[0].deviceId}
                  deviceId={devices[0].deviceId}
                  currentDevice={curLane}
                  cameraSize='sm'
                  cardRef={leftCardRef}
                  position={LANE.RIGHT}
                >
                  Lane 1
                </CheckOutSection>
              </HotkeysProvider> */}
            </div>
          )}
        </div>
      )}
    </>
  );
}
