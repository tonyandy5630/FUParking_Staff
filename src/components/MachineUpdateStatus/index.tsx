import {
  CHANGE_MACHINE_STATUS_ERROR,
  CHANGE_MACHINE_STATUS_SUCCESS,
} from "@constants/message.const";
import React from "react";

type Props = {
  isSuccess: boolean;
};

export default function MachineUpdateStatus({ isSuccess = false }: Props) {
  const status = isSuccess
    ? CHANGE_MACHINE_STATUS_SUCCESS
    : CHANGE_MACHINE_STATUS_ERROR;

  const className = isSuccess ? "text-green-500" : "text-destructive";

  return (
    <div>
      <h2 className={`${className} text-3xl font-bold`}>{status}</h2>
    </div>
  );
}
