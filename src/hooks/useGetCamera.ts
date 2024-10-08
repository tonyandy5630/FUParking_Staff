import {
  GET_CAMERA_LEFT_OTHER_CHANNEL,
  GET_CAMERA_LEFT_PLATE_CHANNEL,
  GET_CAMERA_RIGHT_OTHER_CHANNEL,
  GET_CAMERA_RIGHT_PLATE_CHANNEL,
} from "@channels/index";
import { useEffect, useState } from "react";

export type CameraLane = {
  plateCameraId: string;
  otherCameraId: string;
};

const initState = {
  left: {
    plateCameraId: "",
    otherCameraId: "",
  },
  right: {
    plateCameraId: "",
    otherCameraId: "",
  },
};

export default function useGetCamera() {
  const [laneCameras, setLaneCameras] = useState<{
    left: CameraLane;
    right: CameraLane;
  }>(initState);

  useEffect(() => {
    let shouldUpdate = true;

    const getCameraIds = async () => {
      try {
        Promise.all([
          window.ipcRenderer.invoke(GET_CAMERA_LEFT_PLATE_CHANNEL),
          window.ipcRenderer.invoke(GET_CAMERA_LEFT_OTHER_CHANNEL),
          window.ipcRenderer.invoke(GET_CAMERA_RIGHT_PLATE_CHANNEL),
          window.ipcRenderer.invoke(GET_CAMERA_RIGHT_OTHER_CHANNEL),
        ])
          .then((res) => {
            const [
              leftPlateCameraId,
              leftOtherCameraId,
              rightPlateCameraId,
              rightOtherCameraId,
            ] = res;

            if (!shouldUpdate) {
              return;
            }
            setLaneCameras({
              left: {
                otherCameraId: leftOtherCameraId,
                plateCameraId: leftPlateCameraId,
              },
              right: {
                plateCameraId: rightPlateCameraId,
                otherCameraId: rightOtherCameraId,
              },
            });
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (error) {
        console.log(error);
      }
    };

    getCameraIds();

    return () => {
      shouldUpdate = false;
    };
  }, [setLaneCameras]);
  return laneCameras;
}
