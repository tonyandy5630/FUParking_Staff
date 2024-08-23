import { SizeTypes } from "@my_types/my-camera";
import Webcam from "react-webcam";
import Lane from "./Lane";
import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  lazy,
  HTMLAttributes,
} from "react";
import { Button } from "@components/ui/button";
import Frame from "./Frame";
import CameraLane from "./LaneCamera";

interface Props extends HTMLAttributes<HTMLDivElement> {
  deviceId: ConstrainDOMString | undefined;
  cameraSize?: SizeTypes;
  frontImage: string;
  backImage: string;
  isLoading?: boolean;
  plateCameRef: any;
  bodyCameRef: any;
}

function CameraSection({
  cameraSize = "sm",
  frontImage,
  backImage,
  plateCameRef,
  bodyCameRef,
  isLoading = false,
  ...props
}: Props) {
  return (
    <div className='flex justify-stretch h-fit gap-x-1'>
      <CameraLane
        frontImage={frontImage}
        backImage={frontImage}
        webcamRef={plateCameRef}
        isLoading={isLoading}
        deviceId={props.deviceId}
      />
      <CameraLane
        frontImage={frontImage}
        backImage={frontImage}
        webcamRef={bodyCameRef}
        isLoading={isLoading}
        deviceId={props.deviceId}
      />
    </div>
  );
}

export default memo(CameraSection);
