import React, { useCallback, useEffect, useMemo, useState } from "react";
import Frame from "../Frame";
import Webcam from "react-webcam";
import { SelectOptions } from "@components/Form/FormSelect";
import MySelect from "@components/MySelect";
import LanePosition from "@my_types/lane";
import LANE from "@constants/lane.const";
import {
  SET_CAMERA_LEFT_OTHER_CHANNEL,
  SET_CAMERA_LEFT_PLATE_CHANNEL,
  SET_CAMERA_RIGHT_OTHER_CHANNEL,
  SET_CAMERA_RIGHT_PLATE_CHANNEL,
} from "@channels/index";

type Props = {
  laneKey: LanePosition;
};

export default function SetUpCameraLane({ laneKey }: Props) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
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
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
    // Add event listener when component mounts
  }, [handleDevices]);

  const onSelectPlateCamera = useCallback(
    (cameraId: string) => {
      setLaneCameras((prev) => ({ ...prev, plateCameraId: cameraId }));
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
      return (
        <div className='grid grid-rows-[auto_1fr] gap-2 p-2' key={i}>
          <MySelect
            options={cameraOptions}
            onValueChange={i === 0 ? onSelectPlateCamera : onSelectOtherCamera}
            placeholder={`Chọn Camera ${i === 0 ? "Biển số" : "Còn Lại"}`}
            label={`Camera ${i === 0 ? "Biển số" : "Còn Lại"}`}
            col={true}
          />
          <Frame>
            <Webcam
              audio={false}
              className='w-full h-full'
              videoConstraints={{
                deviceId:
                  i === 0
                    ? laneCameras.plateCameraId
                    : laneCameras.otherCameraId,
              }}
              style={{ objectFit: "cover" }}
            />
          </Frame>
        </div>
      );
    });
  }, [laneCameras.plateCameraId, laneCameras.otherCameraId, cameraOptions]);

  return <div className='grid grid-cols-2 gap-x-1'>{cameras}</div>;
}
