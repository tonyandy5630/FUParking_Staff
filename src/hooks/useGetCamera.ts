import {
  GET_CAMERA_LEFT_OTHER_CHANNEL,
  GET_CAMERA_LEFT_PLATE_CHANNEL,
  GET_CAMERA_RIGHT_OTHER_CHANNEL,
  GET_CAMERA_RIGHT_PLATE_CHANNEL,
} from "@channels/index";
import LANE from "@constants/lane.const";
import LanePosition from "@my_types/lane";
import { useEffect, useRef } from "react";

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
  const laneCameras = useRef<{
    left: CameraLane;
    right?: CameraLane;
  }>(initState);

  useEffect(() => {
    let shouldUpdate = true;

    const getCameraIds = () => {
      const leftPlateCameraPromise = window.ipcRenderer.invoke(
        GET_CAMERA_LEFT_PLATE_CHANNEL
      );
      const leftOtherCameraPromise = window.ipcRenderer.invoke(
        GET_CAMERA_LEFT_OTHER_CHANNEL
      );

      const rightPlateCameraPromise = window.ipcRenderer.invoke(
        GET_CAMERA_RIGHT_PLATE_CHANNEL
      );
      const rightOtherCameraPromise = window.ipcRenderer.invoke(
        GET_CAMERA_RIGHT_OTHER_CHANNEL
      );

      Promise.all([
        leftPlateCameraPromise,
        leftOtherCameraPromise,
        rightPlateCameraPromise,
        rightOtherCameraPromise,
      ])
        .then((values) => {
          if (!shouldUpdate) {
            return;
          }
          const leftPlateCameraId = values[0];
          const leftOtherCameraId = values[1];

          const rightPlateCameraId = values[2];
          const rightOtherCameraId = values[3];

          if (rightPlateCameraId && rightOtherCameraId) {
            laneCameras.current = {
              left: {
                otherCameraId: leftOtherCameraId,
                plateCameraId: leftPlateCameraId,
              },
              right: {
                plateCameraId: rightPlateCameraId,
                otherCameraId: rightOtherCameraId,
              },
            };
            return;
          }

          laneCameras.current = {
            left: {
              otherCameraId: leftOtherCameraId,
              plateCameraId: leftPlateCameraId,
            },
            right: undefined,
          };
        })
        .then((error) => {
          console.log(error);
        });
    };

    getCameraIds();

    return () => {
      shouldUpdate = false;
    };
  }, []);

  return laneCameras;
}
