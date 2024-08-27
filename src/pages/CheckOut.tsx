import CheckOutSection from "@components/CheckOutSection";
import { GATE_OUT } from "@constants/gate.const";
import { useCallback, useEffect, useState } from "react";
import useSelectGate from "../hooks/useSelectGate";
import LANE from "@constants/lane.const";

export default function CheckOutPage() {
  useSelectGate(GATE_OUT);

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
    // Add event listener when component mounts
  }, [handleDevices, devices]);

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
