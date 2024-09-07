import CheckInSection from "@components/CheckInSection";
import LaneContainer from "@components/LaneContainer";
import useGetCamera from "../hooks/useGetCamera";
import useRefresh from "../hooks/useRefresh";
import useSelectGate from "../hooks/useSelectGate";
import { GATE_IN } from "@constants/gate.const";

export default function CheckInPage() {
  const cameraIds = useGetCamera();
  useSelectGate(GATE_IN, true);
  useRefresh();

  return (
    <>
      <div className='flex w-full min-h-full'>
        {cameraIds.left !== undefined && (
          <LaneContainer is2Lane={cameraIds.right !== undefined}>
            <CheckInSection
              bodyDeviceId={cameraIds.left.otherCameraId}
              plateDeviceId={cameraIds.left.plateCameraId}
              cameraSize='md'
            >
              Lane 1
            </CheckInSection>
            {cameraIds.right !== undefined && (
              <CheckInSection
                bodyDeviceId={cameraIds.right.otherCameraId}
                plateDeviceId={cameraIds.right.plateCameraId}
                cameraSize='md'
              >
                Lane 1
              </CheckInSection>
            )}
          </LaneContainer>
        )}
      </div>
    </>
  );
}
