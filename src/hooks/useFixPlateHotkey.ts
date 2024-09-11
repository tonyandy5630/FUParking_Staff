import LANE from "@constants/lane.const";
import { useHotkeys } from "react-hotkeys-hook";
import {
  FIX_PLATE_LEFT_NUMBER_KEY,
  FIX_PLATE_RIGHT_NUMBER_KEY,
} from "../hotkeys/key";
import HotkeyHookParams from "@my_types/hotkey-params";

export default function useFixPlateHotKey({
  lane,
  options,
  callback,
}: HotkeyHookParams) {
  useHotkeys(
    lane === LANE.LEFT
      ? FIX_PLATE_LEFT_NUMBER_KEY.key
      : FIX_PLATE_RIGHT_NUMBER_KEY.key,
    () => callback(),
    options
  );
}
