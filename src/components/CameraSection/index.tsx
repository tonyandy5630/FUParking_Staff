import { SizeTypes } from "@my_types/my-camera";
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
  cameraSize?: SizeTypes;
  children: any;
};

export default function CameraSection({ cameraSize = "sm", ...props }: Props) {
  const webcamRef = useRef(null);
  const [plateImg, setPlateImg] = useState("");
  const [size] = useState(getSize(cameraSize));
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = (webcamRef.current as any).getScreenshot();
      setPlateImg(imageSrc);
    }
  }, [webcamRef]);
  return (
    <Lane>
      <div className='flex flex-col items-start justify-between'>
        <p className='text-md'>{props.children}</p>
        <Frame>
          <Webcam
            audio={false}
            ref={webcamRef}
            onClick={capture}
            className='w-full h-full'
            videoConstraints={{
              deviceId: props.deviceId,
            }}
            style={{ objectFit: "cover" }}
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
          onDoubleClick={() => setPlateImg("")}
          className={`aspect-video object-cover`}
          width='100%'
          height='100%'
        />
      </Frame>
    </Lane>
  );
}
