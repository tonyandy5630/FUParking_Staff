import { GET_GATE_IN_ID_CHANNEL, GET_GATE_TYPE_CHANNEL } from "@channels/index";
import { lazy } from "react";
const CameraSection = lazy(() => import("@components/CameraSection"));
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PAGE from "../../url";
import useSelectGate from "../hooks/useSelectGate";
import { GATE_IN } from "@constants/gate.const";
import CheckInSection from "@components/CheckInSection";

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
  }, [handleDevices, curLane, devices.length]);

  return (
    <>
      {devices.length !== 0 && (
        <div className='flex w-full min-h-full'>
          {devices[0] !== undefined && (
            <div className='grid min-w-full grid-cols-2 p-3 space-x-3'>
              <CheckInSection
                key={devices[0].deviceId}
                deviceId={devices[0].deviceId}
                currentDevice={curLane}
                cameraSize='md'
              >
                Lane 1
              </CheckInSection>
              <CheckInSection
                key={devices[0].deviceId}
                deviceId={devices[0].deviceId}
                currentDevice={curLane}
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
