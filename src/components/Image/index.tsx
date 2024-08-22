import React from "react";
import loading from "../../assets/loading.svg";
import logo from "../../assets/Bai_Logo.png";

type Props = {
  src?: string;
  isLoading: boolean;
};

export default function Image({ src, isLoading = false }: Props) {
  return (
    <img
      src={isLoading ? loading : src === "" ? logo : src}
      className={`aspect-video ${
        src === "" ? "object-contain" : "object-cover"
      }`}
      width='100%'
      height='100%'
    />
  );
}
