import { SizeTypes } from "@my_types/my-camera";
import { getSize } from "@utils/camera";
import Webcam from "react-webcam";
import Lane from "./Lane";
import { useCallback, useRef, useState } from "react";
import { CAMERA_MD_HEIGHT, CAMERA_MD_WIDTH } from "@constants/camera.const";
import { Button } from "@components/ui/button";
import Frame from "./Frame";
import { Input } from "@components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { licensePlateAPI } from "@apis/license.api";
import { SuccessResponse } from "@my_types/index";
import { LicenseResponse } from "@my_types/license";
import { toast } from "react-toastify";
import { base64StringToFile } from "@utils/file";

type Props = {
  deviceId: ConstrainDOMString | undefined;
  cameraSize?: SizeTypes;
  children: any;
};

export default function CameraSection({ cameraSize = "sm", ...props }: Props) {
  const webcamRef = useRef(null);
  const [plateImg, setPlateImg] = useState("");
  const [plateText, setPlateText] = useState("");
  const [size] = useState(getSize(cameraSize));

  const plateDetectionMutation = useMutation({
    mutationKey: ["plate-detection"],
    mutationFn: licensePlateAPI,
  });

  const capture = useCallback(() => {
    try {
      if (webcamRef.current) {
        const body = new FormData();
        const imageSrc = (webcamRef.current as any).getScreenshot();
        const file = base64StringToFile(imageSrc, "uploaded_image.png");
        body.append("upload", file);
        body.append("regions", "vn");
        plateDetectionMutation.mutate(body, {
          onSuccess: (res: SuccessResponse<LicenseResponse>) => {
            setPlateText(res.data.results[0].plate);
          },
          onError: (error) => {
            toast.error("Không nhận diện được biển số");
          },
        });
        setPlateImg(imageSrc);
      }
    } catch (error) {
      console.log(error);
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
        <Input
          className='w-2/5 h-7 border-primary'
          placeholder='Biển số xe'
          value={plateText}
        />
        <Button className='h-6 text-primary' variant='ghost'>
          Sửa
        </Button>
      </div>
      <Frame>
        <img
          src={plateImg}
          onDoubleClick={() => setPlateImg("")}
          className={`aspect-video`}
          width='100%'
          height='100%'
        />
      </Frame>
    </Lane>
  );
}
