import { useHotkeys } from "react-hotkeys-hook";
import { SWITCH_LANE_MODE_KEY } from "../hotkeys/key";
import PAGE from "../../url";
import { GET_IS_2_LANE_CHANNEL, SET_IS_2_LANE_CHANNEL } from "@channels/index";
import { useEffect, useState } from "react";

export default function useToggleLaneMode() {
  const [is2Lane, setIs2Lane] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    window.ipcRenderer.invoke(GET_IS_2_LANE_CHANNEL).then((res) => {
      setIsLoading(false);
      setIs2Lane(res);
    });
    return;
  }, []);

  useHotkeys(
    SWITCH_LANE_MODE_KEY.key,
    async () => {
      setIsLoading(true);
      const is2Lane = await window.ipcRenderer.invoke(GET_IS_2_LANE_CHANNEL);
      setIsLoading(false);
      setIs2Lane(!is2Lane);
      window.ipcRenderer.send(SET_IS_2_LANE_CHANNEL, !is2Lane);
    },
    {
      enableOnFormTags: ["input"],
    }
  );

  return {
    is2Lane,
    isLoading,
  };
}
