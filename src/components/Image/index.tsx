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
      loading='lazy'
      src={isLoading ? loading : src === "" ? logo : src}
      className={`aspect-auto w-full h-full ${
        src === "" ? "object-contain" : "object-scale-down"
      }`}
      // width='100%'
      // height='100%'
    />
  );
}
