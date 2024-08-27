import React from "react";
import loading from "../../assets/loading.svg";
import logo from "../../assets/Bai_Logo.png";

type Props = {
  src?: string;
  isLoading: boolean;
  className?: string;
};

export default function Image({ src, isLoading = false, className }: Props) {
  return (
    <img
      loading='lazy'
      src={isLoading ? loading : src === "" ? logo : src}
      className={`aspect-auto ${className} w-full h-full ${
        src === "" ? "object-contain" : "object-cover"
      }`}
    />
  );
}
