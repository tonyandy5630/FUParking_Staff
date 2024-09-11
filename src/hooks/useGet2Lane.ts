import { useEffect, useState } from "react";
import { GET_IS_2_LANE_CHANNEL } from "@channels/index";

export default function useGet2Lane(): boolean {
  const [is2Lane, setIs2Lane] = useState(false);

  useEffect(() => {
    window.ipcRenderer
      .invoke(GET_IS_2_LANE_CHANNEL)
      .then((res) => {
        setIs2Lane(res);
      })
      .catch((err) => console.log(err));
    return;
  }, []);

  return is2Lane;
}
