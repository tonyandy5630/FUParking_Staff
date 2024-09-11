import LANE from "@constants/lane.const";
import HotkeyHookParams from "@my_types/hotkey-params";
import { useHotkeys } from "react-hotkeys-hook";
import { CANCELED_LEFT_HOTKEY, CANCELED_RIGHT_HOTKEY } from "../hotkeys/key";

export default function useCancelHotKey({
  lane,
  options,
  callback,
}: HotkeyHookParams) {
  useHotkeys(
    lane === LANE.LEFT ? CANCELED_LEFT_HOTKEY.key : CANCELED_RIGHT_HOTKEY.key,
    () => callback(),
    options
  );
}
