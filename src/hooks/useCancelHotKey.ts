import LANE from "@constants/lane.const";
import HotkeyHookParams from "@my_types/hotkey-params";
import { useHotkeys } from "react-hotkeys-hook";
import { CANCEL_LEFT_HOTKEY, CANCEL_RIGHT_HOTKEY } from "../hotkeys/key";

export default function useCancelHotKey({
  lane,
  options,
  callback,
}: HotkeyHookParams) {
  useHotkeys(
    lane === LANE.LEFT ? CANCEL_LEFT_HOTKEY.key : CANCEL_RIGHT_HOTKEY.key,
    () => callback(),
    options
  );
}
