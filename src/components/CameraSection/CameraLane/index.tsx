import { SizeTypes } from "@my_types/my-camera";
import Webcam from "react-webcam";
import { memo, useCallback, useMemo, useRef, useState, lazy } from "react";
import Image from "@components/Image";
import Lane from "../Lane";
import Frame from "../Frame";

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
    <div className='flex flex-col items-start justify-between gap-3'>
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
        <Image src={frontImage} isLoading={isLoading} />
      </Frame>
    </div>
  );
}

export default memo(CameraSection);
