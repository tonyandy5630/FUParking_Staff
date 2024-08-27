import { SizeTypes } from "@my_types/my-camera";
import { memo, HTMLAttributes } from "react";
import CameraLane from "./LaneCamera";

interface Props extends HTMLAttributes<HTMLDivElement> {
  plateDeviceId: ConstrainDOMString | undefined;
  bodyDeviceId: ConstrainDOMString | undefined;
  cameraSize?: SizeTypes;
  imageSrc: string;
  bodyImageSrc: string;
  plateImageOut?: string;
  bodyImageOut?: string;
  isLoading?: boolean;
  plateCameRef: any;
  bodyCameRef: any;
}

function CameraSection({
  cameraSize = "sm",
  imageSrc,
  bodyImageSrc,
  plateCameRef,
  bodyCameRef,
  isLoading = false,
  plateImageOut,
  bodyImageOut,
  ...props
}: Props) {
  return (
    <div className='grid grid-cols-2 gap-x-1'>
      <CameraLane
        imageSrc={imageSrc}
        webcamRef={plateCameRef}
        isLoading={isLoading}
        deviceId={props.plateDeviceId}
        imageWebcamSrc={plateImageOut}
      />
      <CameraLane
        imageSrc={bodyImageSrc}
        webcamRef={bodyCameRef}
        isLoading={isLoading}
        deviceId={props.bodyDeviceId}
        imageWebcamSrc={bodyImageOut}
      />
    </div>
  );
}

export default memo(CameraSection);
