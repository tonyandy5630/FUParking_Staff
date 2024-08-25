import { useRef } from "react";
import { useCallback, useEffect, useState } from "react";
import CheckInSection from "@components/CheckInSection";
export default function CheckInPage() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const leftCardRef = useRef<HTMLInputElement>(null);

  const handleDevices = useCallback(
    (mediaDevices: MediaDeviceInfo[]) => {
      setDevices(
        mediaDevices.filter(
          ({ kind }: MediaDeviceInfo) => kind === "videoinput"
        )
      );
    },
    [setDevices]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices, , devices.length]);

  return (
    <>
      {devices.length !== 0 && (
        <div className='flex w-full min-h-full'>
          {devices[0] !== undefined && (
            <div className='grid min-w-full grid-cols-2 pt-1 space-x-1 justify-items-stretch'>
              <CheckInSection
                key={devices[0].deviceId}
                bodyDeviceId={devices[1].deviceId}
                plateDeviceId={devices[0].deviceId}
                cameraSize='md'
                cardRef={leftCardRef}
              >
                Lane 1
              </CheckInSection>
              {/* <CheckInSection
                key={devices[0].deviceId}
                deviceId={devices[0].deviceId}
                currentDevice={curLane}
                cardRef={rightCardRef}
                cameraSize='md'
              >
                Lane 1
              </CheckInSection> */}
            </div>
          )}
        </div>
      )}
    </>
  );
}
