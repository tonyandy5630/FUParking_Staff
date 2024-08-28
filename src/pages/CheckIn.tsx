import { useCallback, useEffect, useRef, useState } from "react";
import CheckInSection from "@components/CheckInSection";
import LaneContainer from "@components/LaneContainer";
import useGetCamera from "../hooks/useGetCamera";
export default function CheckInPage() {
  const cameraIds = useGetCamera();

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
