import CheckOutSection from "@components/CheckOutSection";
import { GATE_OUT } from "@constants/gate.const";
import { useRef } from "react";
import { useCallback, useEffect, useState } from "react";
import useSelectGate from "../hooks/useSelectGate";
import LANE from "@constants/lane.const";

export default function CheckOutPage() {
  useSelectGate(GATE_OUT);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [curLane, setCurLane] = useState("");
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
              <CheckOutSection
                key={devices[0].deviceId}
                plateDeviceId={devices[0].deviceId}
                bodyDeviceId={devices[1].deviceId}
                currentDevice={curLane}
                cameraSize='sm'
                cardRef={leftCardRef}
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
