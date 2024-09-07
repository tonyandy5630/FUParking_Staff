import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import { REFRESH_HOTKEY } from "../hotkeys/key";

export default function useRefresh() {
  const navigate = useNavigate();

  useHotkeys(
    REFRESH_HOTKEY.key,
    () => {
      navigate(0);
    },
    { enableOnFormTags: ["INPUT", "SELECT"] }
  );
}
