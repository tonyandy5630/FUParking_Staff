import { useRef } from "react";
import { useCallback, useEffect, useState } from "react";
import CheckInSection from "@components/CheckInSection";

export default function CheckInPage() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [curLane, setCurLane] = useState("");
  const leftCardRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (leftCardRef.current) {
      leftCardRef.current.focus();
      console.log(true);
    }
  }, [leftCardRef]);

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
            <div className='grid min-w-full grid-cols-2 pt-1 space-x-1 justify-items-stretch'>
              <CheckInSection
                key={devices[0].deviceId}
                deviceId={devices[0].deviceId}
                currentDevice={curLane}
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
