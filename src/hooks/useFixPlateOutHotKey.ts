import LANE from "@constants/lane.const";
import { useHotkeys } from "react-hotkeys-hook";
import {
  FIX_PLATE_OUT_LEFT_HOTKEY,
  FIX_PLATE_OUT_RIGHT_HOTKEY,
} from "../hotkeys/key";
import HotkeyHookParams from "@my_types/hotkey-params";

export default function useFixPlateOutHotKey({
  callback,
  lane,
  options,
}: HotkeyHookParams) {
  useHotkeys(
    lane === LANE.LEFT
      ? FIX_PLATE_OUT_LEFT_HOTKEY.key
      : FIX_PLATE_OUT_RIGHT_HOTKEY.key,
    async () => await callback(),
    options
  );
}
