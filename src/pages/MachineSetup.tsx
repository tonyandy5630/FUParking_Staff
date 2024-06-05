import { Button } from "@components/ui/button";
import { TO_LOGIN_CHANNEL } from "@channels/index";
import React from "react";

export default function MachineSetupPage() {
  const handleSend = () => {
    window.ipcRenderer.send(TO_LOGIN_CHANNEL);
  };
  return (
    <div>
      <Button onClick={handleSend}>Send</Button>
    </div>
  );
}
