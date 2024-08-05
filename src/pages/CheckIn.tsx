import { lazy } from "react";
const CameraSection = lazy(() => import("@components/CameraSection"));
import { useCallback, useEffect, useState } from "react";

export default function CheckInPage() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [curLane, setCurLane] = useState("");

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
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if Ctrl key is pressed and Tab key is pressed simultaneously
      event.stopPropagation();

      if (devices.length === 1) {
        setCurLane(devices[0].deviceId);
      }

      if (devices.length < 2) {
        return;
      }

      if (event.ctrlKey) {
        if (event.key === "Tab") {
          if (curLane === devices[0].deviceId) setCurLane(devices[1].deviceId);
          else setCurLane(devices[0].deviceId);
        }
      }
    };

    // Add event listener when component mounts
    document.addEventListener("keydown", handleKeyPress);

    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleDevices, curLane, devices]);
  return (
    <>
      {devices.length !== 0 && (
        <div className='flex justify-between w-full min-h-full gap-x-2'>
          {devices[0] !== undefined && (
            <CameraSection
              key={devices[0].deviceId}
              deviceId={devices[0].deviceId}
              currentDevice={curLane}
              cameraSize='md'
            >
              Lane 1
            </CameraSection>
          )}
          {devices[1] !== undefined && (
            <CameraSection
              key={devices[1].deviceId}
              deviceId={devices[1].deviceId}
              currentDevice={curLane}
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
