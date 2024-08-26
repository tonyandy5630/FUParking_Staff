import { SizeTypes } from "@my_types/my-camera";
import { memo, HTMLAttributes } from "react";
import CameraLane from "./LaneCamera";

interface Props extends HTMLAttributes<HTMLDivElement> {
  plateDeviceId: ConstrainDOMString | undefined;
  bodyDeviceId: ConstrainDOMString | undefined;
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
    <div className='grid grid-cols-2 gap-x-1'>
      <CameraLane
        frontImage={frontImage}
        backImage={frontImage}
        webcamRef={plateCameRef}
        isLoading={isLoading}
        deviceId={props.plateDeviceId}
      />
      <CameraLane
        frontImage={backImage}
        backImage={backImage}
        webcamRef={bodyCameRef}
        isLoading={isLoading}
        deviceId={props.bodyDeviceId}
      />
    </div>
  );
}

export default memo(CameraSection);
