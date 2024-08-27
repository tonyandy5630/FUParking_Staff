import { SizeTypes } from "@my_types/my-camera";
import { memo, HTMLAttributes } from "react";
import CameraLane from "./LaneCamera";

interface Props extends HTMLAttributes<HTMLDivElement> {
  plateDeviceId: ConstrainDOMString | undefined;
  bodyDeviceId: ConstrainDOMString | undefined;
  cameraSize?: SizeTypes;
  plateImage: string;
  bodyImage: string;
  isLoading?: boolean;
  plateCameRef: any;
  bodyCameRef: any;
}

function CameraSection({
  cameraSize = "sm",
  plateImage,
  bodyImage,
  plateCameRef,
  bodyCameRef,
  isLoading = false,
  ...props
}: Props) {
  return (
    <div className='grid grid-cols-2 gap-x-1'>
      <CameraLane
        imageSrc={plateImage}
        webcamRef={plateCameRef}
        isLoading={isLoading}
        deviceId={props.plateDeviceId}
      />
      <CameraLane
        imageSrc={bodyImage}
        webcamRef={bodyCameRef}
        isLoading={isLoading}
        deviceId={props.bodyDeviceId}
      />
    </div>
  );
}

export default memo(CameraSection);
