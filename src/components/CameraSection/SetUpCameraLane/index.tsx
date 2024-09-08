import React, { useCallback, useEffect, useMemo, useState } from "react";
import Frame from "../Frame";
import Webcam from "react-webcam";
import { SelectOptions } from "@components/Form/FormSelect";
import MySelect from "@components/MySelect";
import LanePosition from "@my_types/lane";
import LANE from "@constants/lane.const";
import {
  GET_NOT_FIRST_TIME_CHANNEL,
  SET_CAMERA_LEFT_OTHER_CHANNEL,
  SET_CAMERA_LEFT_PLATE_CHANNEL,
  SET_CAMERA_RIGHT_OTHER_CHANNEL,
  SET_CAMERA_RIGHT_PLATE_CHANNEL,
  SET_NOT_FIRST_TIME_CHANNEL,
} from "@channels/index";
import useGetCamera from "../../../hooks/useGetCamera";

type Props = {
  laneKey: LanePosition;
};

export default function SetUpCameraLane({ laneKey }: Props) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const cameraIds = useGetCamera();
  const [laneCameras, setLaneCameras] = useState({
    plateCameraId: "",
    otherCameraId: "",
  });

  const handleDevices = useCallback(
    (mediaDevices: MediaDeviceInfo[]) => {
      const videoInputs = mediaDevices.filter(
        ({ kind }: MediaDeviceInfo) => kind === "videoinput"
      );
      setDevices(videoInputs);
    },
    [setDevices]
  );

  useEffect(() => {
    if (laneKey === LANE.LEFT) {
      setLaneCameras((prev) => ({
        plateCameraId: cameraIds.left.plateCameraId,
        otherCameraId: cameraIds.left.otherCameraId,
      }));
      return;
    }
    setLaneCameras((prev) => ({
      plateCameraId: cameraIds.right?.plateCameraId ?? "",
      otherCameraId: cameraIds.right?.otherCameraId ?? "",
    }));
  }, [cameraIds]);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
    // Add event listener when component mounts
  }, [handleDevices]);

  const onSelectPlateCamera = useCallback(
    async (cameraId: string) => {
      setLaneCameras((prev) => ({ ...prev, plateCameraId: cameraId }));
      const notFirstTimeSetup = await window.ipcRenderer.invoke(
        GET_NOT_FIRST_TIME_CHANNEL
      );
      if (!notFirstTimeSetup) {
        window.ipcRenderer.send(SET_NOT_FIRST_TIME_CHANNEL, true);
      }

      if (laneKey === LANE.LEFT) {
        window.ipcRenderer.send(SET_CAMERA_LEFT_PLATE_CHANNEL, cameraId);
        return;
      }

      if (laneKey === LANE.RIGHT) {
        window.ipcRenderer.send(SET_CAMERA_RIGHT_PLATE_CHANNEL, cameraId);
        return;
      }
    },
    [laneKey, setLaneCameras]
  );

  const onSelectOtherCamera = useCallback(
    (cameraId: string) => {
      setLaneCameras((prev) => ({ ...prev, otherCameraId: cameraId }));
      if (laneKey === LANE.LEFT) {
        window.ipcRenderer.send(SET_CAMERA_LEFT_OTHER_CHANNEL, cameraId);
        return;
      }

      if (laneKey === LANE.RIGHT) {
        window.ipcRenderer.send(SET_CAMERA_RIGHT_OTHER_CHANNEL, cameraId);
        return;
      }
    },
    [laneKey, setLaneCameras]
  );

  const cameraOptions: SelectOptions[] = useMemo(() => {
    return devices.map((item) => ({
      name: item.label,
      value: item.deviceId,
    }));
  }, [devices]);

  const cameras = useMemo(() => {
    return Array.from({ length: 2 }, (_, i) => {
      const isPlate = i === 0;

      return (
        <div className='grid grid-rows-[auto_1fr] gap-2 p-2' key={i}>
          <MySelect
            defaultValue={
              isPlate ? laneCameras.plateCameraId : laneCameras.otherCameraId
            }
            options={cameraOptions}
            onValueChange={isPlate ? onSelectPlateCamera : onSelectOtherCamera}
            placeholder={`Chọn Camera ${isPlate ? "Biển số" : "Còn Lại"}`}
            label={`Camera ${isPlate ? "Biển số" : "Còn Lại"}`}
            value={
              isPlate ? laneCameras.plateCameraId : laneCameras.otherCameraId
            }
            col={true}
          />
          <Frame>
            <Webcam
              audio={false}
              className='w-full h-full'
              videoConstraints={{
                deviceId: isPlate
                  ? laneCameras.plateCameraId
                  : laneCameras.otherCameraId,
              }}
              style={{ objectFit: "cover" }}
            />
          </Frame>
        </div>
      );
    });
  }, [laneCameras, cameraOptions, laneKey]);

  return <div className='grid grid-cols-2 gap-x-1'>{cameras}</div>;
}
