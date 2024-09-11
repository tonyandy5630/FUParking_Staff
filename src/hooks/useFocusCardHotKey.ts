import LANE from "@constants/lane.const";
import HotkeyHookParams from "@my_types/hotkey-params";
import { useHotkeys } from "react-hotkeys-hook";
import {
  FOCUS_CARD_INPUT_LEFT_KEY,
  FOCUS_CARD_INPUT_RIGHT_KEY,
} from "../hotkeys/key";

export default function useFocusCardHotKey({
  callback,
  options,
  lane,
}: HotkeyHookParams): void {
  useHotkeys(
    lane === LANE.LEFT
      ? FOCUS_CARD_INPUT_LEFT_KEY.key
      : FOCUS_CARD_INPUT_RIGHT_KEY.key,
    async () => await callback(),
    options
  );
}
