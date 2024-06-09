import CameraSection from "@components/CameraSection";
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
        <div className='flex w-full min-h-full gap-x-2'>
          <CameraSection deviceId={devices[1].deviceId} cameraSize='md'>
            Lane 1
          </CameraSection>
          <CameraSection deviceId={devices[0].deviceId} cameraSize='md'>
            Lane 2
          </CameraSection>
        </div>
      )}
    </>
  );
}
