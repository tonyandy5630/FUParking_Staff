import {
  CANCELED_HOTKEY,
  FIX_PLATE_NUMBER_KEY,
  FOCUS_CARD_INPUT_KEY,
  HELP_KEY,
  REFRESH_HOTKEY,
  SUBMIT_LEFT_HOTKEY,
  SUBMIT_RIGHT_HOTKEY,
} from "../../../hotkeys/key";

export const HotKeyTableHeaders = ["Phím tắt", "Chức năng"];

export const HotKeyContents = [
  {
    hotkey: FOCUS_CARD_INPUT_KEY.key,
    function: FOCUS_CARD_INPUT_KEY.function,
  },
  {
    hotkey: FIX_PLATE_NUMBER_KEY.key,
    function: FIX_PLATE_NUMBER_KEY.function,
  },

  {
    hotkey: SUBMIT_LEFT_HOTKEY.key,
    function: SUBMIT_LEFT_HOTKEY.function,
  },
  {
    hotkey: SUBMIT_RIGHT_HOTKEY.key,
    function: SUBMIT_RIGHT_HOTKEY.function,
  },
  {
    hotkey: CANCELED_HOTKEY.key,
    function: CANCELED_HOTKEY.function,
  },
  {
    hotkey: REFRESH_HOTKEY.key,
    function: REFRESH_HOTKEY.function,
  },
  {
    hotkey: HELP_KEY.key,
    function: HELP_KEY.function,
  },
];
