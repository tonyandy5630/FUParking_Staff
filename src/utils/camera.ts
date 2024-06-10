import {
  CAMERA_MD,
  SCREENSHOT_SM,
  CAMERA_SM,
  SCREENSHOT_MD,
} from "@constants/camera.const";
import { SizeTypes, Size, Device } from "@my_types/my-camera";

export function getSize(size: SizeTypes, type: Device = "camera"): Size {
  switch (size) {
    case "md":
      return type === "camera" ? CAMERA_MD : SCREENSHOT_MD;
    case "sm":
      return type === "camera" ? CAMERA_SM : SCREENSHOT_SM;
    default:
      return type === "camera" ? CAMERA_MD : SCREENSHOT_MD;
  }
}
