import { lazy, Suspense, useMemo } from "react";
const LaneContainer = lazy(() => import("@components/LaneContainer"));
import useGetCamera from "../hooks/useGetCamera";
import useRefresh from "../hooks/useRefresh";
import useSelectGate from "../hooks/useSelectGate";
import { GATE_IN, GATE_OUT } from "@constants/gate.const";
import LANE from "@constants/lane.const";
import useToggleLaneMode from "../hooks/useToggleLaneMode";
import useGetLaneMode from "../hooks/useGetLaneMode";
import useGetLogin from "../hooks/useGetLogIn";
import VerificationFallback from "@components/Fallback/VerificationFallback";
const CheckInSection = lazy(() => import("@components/CheckInSection"));
const CheckoutSection = lazy(() => import("@components/CheckOutSection"));

export default function CheckInPage() {
  const cameraIds = useGetCamera();
  const { is2Lane: isSetting2Lane } = useToggleLaneMode();
  const leftLaneMode = useGetLaneMode(LANE.LEFT);
  const rightLaneMode = useGetLaneMode(LANE.RIGHT);
  useGetLogin(true);
  const { isLoadingGateData } = useSelectGate(true);
  useRefresh();

  const LeftLane = useMemo(() => {
    if (leftLaneMode === GATE_IN) {
      return (
        <Suspense fallback={<p>Loading...</p>}>
          <CheckInSection
            bodyDeviceId={cameraIds.left.otherCameraId}
            plateDeviceId={cameraIds.left.plateCameraId}
            position={LANE.LEFT}
            key={LANE.LEFT}
          />
        </Suspense>
      );
    } else if (leftLaneMode === GATE_OUT) {
      return (
        <Suspense fallback={<p>Loading...</p>}>
          <CheckoutSection
            plateDeviceId={cameraIds.left.plateCameraId}
            bodyDeviceId={cameraIds.left.otherCameraId}
            position={LANE.LEFT}
            key={LANE.LEFT}
          />
        </Suspense>
      );
    }
  }, [
    leftLaneMode,
    cameraIds.left.otherCameraId,
    cameraIds.left.plateCameraId,
  ]);

  const RightLane = useMemo(() => {
    if (!isSetting2Lane) {
      return <></>;
    }
    if (rightLaneMode === GATE_IN) {
      return (
        <Suspense fallback={<p>Loading...</p>}>
          <CheckInSection
            bodyDeviceId={cameraIds.right.otherCameraId}
            plateDeviceId={cameraIds.right.plateCameraId}
            position={LANE.RIGHT}
            key={LANE.RIGHT}
          />{" "}
        </Suspense>
      );
    } else if (rightLaneMode === GATE_OUT) {
      return (
        <Suspense fallback={<p>Loading...</p>}>
          <CheckoutSection
            plateDeviceId={cameraIds.right.plateCameraId}
            bodyDeviceId={cameraIds.right.otherCameraId}
            key={LANE.RIGHT}
            position={LANE.RIGHT}
          />{" "}
        </Suspense>
      );
    }
  }, [
    rightLaneMode,
    cameraIds.right.otherCameraId,
    cameraIds.right.plateCameraId,
    isSetting2Lane,
  ]);

  const LaneComp = useMemo(() => {
    if (isLoadingGateData) return <VerificationFallback />;
    else
      return (
        <LaneContainer is2Lane={isSetting2Lane}>
          {LeftLane}
          {RightLane}
        </LaneContainer>
      );
  }, [isSetting2Lane, isLoadingGateData]);

  return (
    <>
      <div className='flex w-full min-h-full'>{LaneComp}</div>
    </>
  );
}
