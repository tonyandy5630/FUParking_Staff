import { SizeTypes } from "@my_types/my-camera";
import Webcam from "react-webcam";
import Lane from "./Lane";
import { memo, useCallback, useMemo, useRef, useState, lazy } from "react";
import { Button } from "@components/ui/button";
import Frame from "./Frame";
import CameraLane from "./CameraLane";

export type Props = {
  deviceId: ConstrainDOMString | undefined;
  cameraSize?: SizeTypes;
  frontImage: string;
  backImage: string;
  isLoading?: boolean;
  webcamRef: any;
};

function CameraSection({
  cameraSize = "sm",
  frontImage,
  backImage,
  webcamRef,
  isLoading = false,
  ...props
}: Props) {
  return (
    <div className='flex min-w-full gap-2 h-[50%]'>
      <CameraLane
        frontImage={frontImage}
        backImage={frontImage}
        webcamRef={webcamRef}
        isLoading={isLoading}
        deviceId={props.deviceId}
      />
      <CameraLane
        frontImage={frontImage}
        backImage={frontImage}
        webcamRef={webcamRef}
        isLoading={isLoading}
        deviceId={props.deviceId}
      />
    </div>
  );
}

export default memo(CameraSection);
