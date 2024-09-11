import { OptionsOrDependencyArray } from "react-hotkeys-hook/dist/types";
import LanePosition from "./lane";

export default interface HotkeyHookParams {
  lane: LanePosition;
  callback: () => void | Promise<void>;
  options: OptionsOrDependencyArray;
}
