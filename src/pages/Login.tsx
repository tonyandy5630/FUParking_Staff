import { demoAPI } from "@apis/auth.api";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export default function Login(): JSX.Element {
  const { data } = useQuery({
    queryKey: ["/demo"],
    queryFn: demoAPI,
  });

  return (
    <div>
      <h1 className='text-red-300'>{data?.data?.content ?? "Error"}</h1>
    </div>
  );
}
