import { lazy } from "react";
const CameraSection = lazy(() => import("@components/CameraSection"));
import { useCallback, useEffect, useState } from "react";

export default function CheckInPage() {
  const [deviceId, setDeviceId] = useState({});
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

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
  }, [handleDevices]);
  return (
    <>
      {devices.length !== 0 && (
        <div className='flex justify-between w-full min-h-full gap-x-2'>
          {devices[0] !== undefined && (
            <CameraSection
              key={devices[0].deviceId}
              deviceId={devices[0].deviceId}
              cameraSize='md'
            >
              Lane 1
            </CameraSection>
          )}
          {devices[0] !== undefined && (
            <CameraSection
              key={"test"}
              deviceId={devices[0].deviceId}
              cameraSize='md'
            >
              Lane 2
            </CameraSection>
          )}
        </div>
      )}
    </>
  );
}
