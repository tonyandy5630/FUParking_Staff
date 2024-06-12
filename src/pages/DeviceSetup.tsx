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
import { HIDDevice } from "electron";
import { useCallback, useEffect, useMemo, useState } from "react";
import Webcam from "react-webcam";

export default function DeviceSetupPage() {
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [hidDevices, setHidDevices] = useState<HIDDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [selectHidDevice, setSelectHidDevice] = useState<number>();

  const getDevicesAsync = useCallback(async (e?: Event) => {
    const list = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = list.filter((i) => i.kind === "videoinput");
    setCameraDevices((prev) => videoInputs);
  }, []);

  const onSelectCameraDevice = useCallback((e: string) => {
    setSelectedDeviceId(e);
  }, []);
  console.log("re");

  const onSelectHidDevice = useCallback((e: string) => {
    setSelectHidDevice(parseInt(e));
  }, []);

  const cameraItems = useMemo(
    () =>
      cameraDevices.map((item) => (
        <SelectItem key={item.deviceId} value={item.deviceId}>
          {item.label}
        </SelectItem>
      )),

    [cameraDevices]
  );

  const hidItems = useMemo(
    () =>
      hidDevices.map((item) => (
        <SelectItem key={item.deviceId} value={item.deviceId}>
          {item.name}
        </SelectItem>
      )),
    [hidDevices]
  );

  const getHID = async (open: boolean) => {
    if (!open) {
      return;
    }

    await navigator.hid.requestDevice({ filters: [] });
    window.ipcRenderer.on("send-devices", (e, data: HIDDevice[]) => {
      setHidDevices(data);
    });
  };

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
          <Select onValueChange={onSelectCameraDevice}>
            <SelectTrigger className='w-fit'>
              <SelectValue placeholder='Chọn Camera' />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>{cameraItems}</SelectGroup>
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
        <p>May the</p>
        <Select onValueChange={onSelectHidDevice} onOpenChange={getHID}>
          <SelectTrigger className='w-fit'>
            <SelectValue placeholder='Chọn máy đọc thẻ' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>{hidItems}</SelectGroup>
          </SelectContent>
        </Select>
      </Lane>
    </div>
  );
}
