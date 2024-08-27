import { useCallback, useEffect, useRef, useState } from "react";
import CheckInSection from "@components/CheckInSection";
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
  }, [handleDevices, devices]);

  return (
    <>
      {devices.length !== 0 && (
        <div className={`flex w-full min-h-full`}>
          {devices[0] !== undefined && (
            <div
              className={`grid min-w-full ${
                is2Lane.current
                  ? "grid-cols-2 justify-items-stretch"
                  : "grid-cols-1 justify-items-center"
              } pt-1 space-x-1 `}
            >
              <CheckInSection
                key={devices[0].deviceId}
                bodyDeviceId={devices[1].deviceId}
                plateDeviceId={devices[0].deviceId}
                cameraSize='md'
              >
                Lane 1
              </CheckInSection>
            </div>
          )}
        </div>
      )}
    </>
  );
}
