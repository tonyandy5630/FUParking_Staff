import React from "react";

interface MessageProps {
  children?: string;
  success?: boolean;
  error?: boolean;
  pending?: boolean;
}

export default function Message({
  error,
  children,
  pending,
  success,
}: MessageProps) {
  return (
    <p
      className={` font-bold ${
        error
          ? "text-destructive"
          : pending
          ? "text-orange-500"
          : "text-green-500"
      }`}
    >
      {children}
    </p>
  );
}
