import CheckOutSection from "@components/CheckOutSection";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LANE from "@constants/lane.const";
import LaneContainer from "@components/LaneContainer";
import useGetCamera from "../hooks/useGetCamera";
import useRefresh from "../hooks/useRefresh";

export default function CheckOutPage() {
  const cameraIds = useGetCamera();
  useRefresh();
  return (
    <>
      <div className='flex w-full min-h-full'>
        {cameraIds.left !== undefined && (
          <LaneContainer is2Lane={cameraIds.right !== undefined}>
            <CheckOutSection
              plateDeviceId={cameraIds.left.plateCameraId}
              bodyDeviceId={cameraIds.left.otherCameraId}
              cameraSize='sm'
              position={LANE.LEFT}
            >
              Lane 1
            </CheckOutSection>
            {cameraIds.right !== undefined && (
              <CheckOutSection
                plateDeviceId={cameraIds.right.plateCameraId}
                bodyDeviceId={cameraIds.right.otherCameraId}
                cameraSize='sm'
                position={LANE.RIGHT}
              >
                Lane 1
              </CheckOutSection>
            )}
          </LaneContainer>
        )}
      </div>
    </>
  );
}
