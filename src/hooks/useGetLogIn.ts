import { GET_LOG_IN_CHANNEL } from "@channels/index";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PAGE from "../../url";

export default function useGetLogin(shouldBackToLogin?: boolean) {
  const isLoggedIn = useRef(false);
  const navigate = useNavigate();
  useEffect(() => {
    window.ipcRenderer
      .invoke(GET_LOG_IN_CHANNEL)
      .then((res) => {
        isLoggedIn.current = res;
        if (!res && shouldBackToLogin) {
          navigate(PAGE.LOGIN);
          return;
        }
      })
      .catch((err) => console.log(err));
  }, []);

  return isLoggedIn.current;
}
