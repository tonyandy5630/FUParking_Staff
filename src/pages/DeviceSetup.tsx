import Frame from "@components/CameraSection/Frame";
import Lane from "@components/CameraSection/Lane";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { useCallback, useEffect, useMemo, useState } from "react";
import Webcam from "react-webcam";

export default function DeviceSetupPage() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  const getDevicesAsync = useCallback(async (e?: Event) => {
    const list = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = list.filter((i) => i.kind === "videoinput");
    setDevices((prev) => videoInputs);
  }, []);

  const onSelectDevice = useCallback((e: string) => {
    setSelectedDeviceId(e);
  }, []);

  const deviceItems = useMemo(
    () =>
      devices.map((item) => (
        <SelectItem key={item.deviceId} value={item.deviceId}>
          {item.label}
        </SelectItem>
      )),
    [devices]
  );

  useEffect(() => {
    //* Get all devices at first render
    getDevicesAsync();
    //* Get all devices when there is changes in devices
    navigator.mediaDevices.ondevicechange = getDevicesAsync;
  }, [getDevicesAsync]);

  return (
    <div className='flex items-center justify-between w-full h-full px-10 bg-red-300'>
      <Lane>
        <h3>Bên trái</h3>
        <div className='py-4'>
          <Select onValueChange={onSelectDevice}>
            <SelectTrigger className='w-fit'>
              <SelectValue placeholder='Chọn Camera' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>{deviceItems}</SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Frame size='sm'>
          <Webcam
            audio={false}
            className='w-full h-full'
            videoConstraints={{
              deviceId: selectedDeviceId,
            }}
            style={{
              objectFit: "fill",
            }}
          />
        </Frame>
      </Lane>
    </div>
  );
}
