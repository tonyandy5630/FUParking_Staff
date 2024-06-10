import { sizeTypes } from "@my_types/my-camera";
import { getSize } from "@utils/camera";
import Webcam from "react-webcam";
import Lane from "./Lane";
import { useCallback, useRef, useState } from "react";
import { CAMERA_MD_HEIGHT, CAMERA_MD_WIDTH } from "@constants/camera.const";
import { Button } from "@components/ui/button";
import Frame from "./Frame";
import { Input } from "@components/ui/input";

type Props = {
  deviceId: ConstrainDOMString | undefined;
  cameraSize?: sizeTypes;
  children: any;
};

export default function CameraSection({ cameraSize = "sm", ...props }: Props) {
  const webcamRef = useRef(null);
  const [plateImg, setPlateImg] = useState();
  const [size] = useState(getSize("md"));
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = (webcamRef.current as any).getScreenshot();
      setPlateImg(imageSrc);
    }
  }, [webcamRef]);
  console.log();
  return (
    <Lane>
      <div className='flex flex-col items-start justify-between'>
        <p className='text-md'>{props.children}</p>
        <Frame>
          <Webcam
            audio={false}
            ref={webcamRef}
            onClick={capture}
            videoConstraints={{
              deviceId: props.deviceId,
              height: size.height,
              width: size.width,
              aspectRatio: 3,
            }}
          />
        </Frame>
      </div>
      <div className='flex items-center justify-end w-full gap-x-1 h-fit'>
        <Input className='w-2/5 h-7 border-primary' placeholder='Biển số xe' />
        <Button className='h-6 text-primary' variant='ghost'>
          Sửa
        </Button>
      </div>
      <Frame>
        <img
          src={plateImg}
          className={`w-[${size.width}px]  h-[${size.height}px]`}
          width={"100%"}
          height={"100%"}
        />
      </Frame>
    </Lane>
  );
}
