import React from "react";
import Header from "./Header";

type Props = {
  children: any;
};
export default function Container({ children }: Props) {
  return (
    <div className='flex flex-col items-center w-full h-full min-h-full'>
      <Header />
      <main className='flex flex-col items-center justify-center h-full min-w-full'>
        {children}
      </main>
    </div>
  );
}
