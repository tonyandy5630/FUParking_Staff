import { SizeTypes } from "@my_types/my-camera";
import Webcam from "react-webcam";
import { memo } from "react";
import Image from "@components/Image";
import Lane from "../Lane";
import Frame from "../Frame";

export type Props = {
  deviceId: ConstrainDOMString | undefined;
  cameraSize?: SizeTypes;
  imageSrc: string;
  isLoading?: boolean;
  webcamRef: any;
};

function LaneCamera({
  cameraSize = "sm",
  imageSrc,
  webcamRef,
  isLoading = false,
  ...props
}: Props) {
  return (
    <div className='flex flex-col flex-grow gap-1'>
      <Frame>
        <Webcam
          audio={false}
          ref={webcamRef}
          className='w-full h-full'
          videoConstraints={{
            deviceId: props.deviceId,
          }}
          style={{ objectFit: "cover" }}
        />
      </Frame>
      <Frame>
        <Image src={imageSrc} isLoading={isLoading} />
      </Frame>
    </div>
  );
}

export default memo(LaneCamera);
