import {
  GET_CAMERA_LEFT_OTHER_CHANNEL,
  GET_CAMERA_LEFT_PLATE_CHANNEL,
  GET_CAMERA_RIGHT_OTHER_CHANNEL,
  GET_CAMERA_RIGHT_PLATE_CHANNEL,
} from "@channels/index";
import LANE from "@constants/lane.const";
import LanePosition from "@my_types/lane";
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
  right: undefined,
};

export default function useGetCamera() {
  const [laneCameras, setLaneCameras] = useState<{
    left: CameraLane;
    right?: CameraLane;
  }>(initState);

  useEffect(() => {
    let shouldUpdate = true;

    const getCameraIds = async () => {
      try {
        const [
          leftPlateCameraId,
          leftOtherCameraId,
          rightPlateCameraId,
          rightOtherCameraId,
        ] = await Promise.all([
          window.ipcRenderer.invoke(GET_CAMERA_LEFT_PLATE_CHANNEL),
          window.ipcRenderer.invoke(GET_CAMERA_LEFT_OTHER_CHANNEL),
          window.ipcRenderer.invoke(GET_CAMERA_RIGHT_PLATE_CHANNEL),
          window.ipcRenderer.invoke(GET_CAMERA_RIGHT_OTHER_CHANNEL),
        ]);

        if (!shouldUpdate) {
          return;
        }

        setLaneCameras({
          left: {
            otherCameraId: leftOtherCameraId,
            plateCameraId: leftPlateCameraId,
          },
          right:
            rightPlateCameraId !== "" && rightOtherCameraId !== ""
              ? {
                  plateCameraId: rightPlateCameraId,
                  otherCameraId: rightOtherCameraId,
                }
              : undefined,
        });
      } catch (error) {
        console.log(error);
      }
    };

    getCameraIds();

    return () => {
      shouldUpdate = false;
    };
  }, []);

  return laneCameras;
}
