import CheckInSection from "@components/CheckInSection";
import LaneContainer from "@components/LaneContainer";
import useGetCamera from "../hooks/useGetCamera";
import useRefresh from "../hooks/useRefresh";
import useSelectGate from "../hooks/useSelectGate";
import { GATE_IN } from "@constants/gate.const";
import PAGE from "../../url";
import LANE from "@constants/lane.const";
import useToggleLaneMode from "../hooks/useToggleLaneMode";

export default function CheckInPage() {
  const cameraIds = useGetCamera();
  const { is2Lane: isSetting2Lane } = useToggleLaneMode();
  useSelectGate(GATE_IN, true);
  useRefresh();

  return (
    <>
      <div className='flex w-full min-h-full'>
        {cameraIds.left !== undefined && (
          <LaneContainer is2Lane={isSetting2Lane}>
            <CheckInSection
              bodyDeviceId={cameraIds.left.otherCameraId}
              plateDeviceId={cameraIds.left.plateCameraId}
              position={LANE.LEFT}
              cameraSize='md'
            >
              Lane 1
            </CheckInSection>
            {isSetting2Lane && (
              <CheckInSection
                bodyDeviceId={cameraIds.right.otherCameraId}
                plateDeviceId={cameraIds.right.plateCameraId}
                position={LANE.RIGHT}
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
