import React from "react";
import { Outlet } from "react-router-dom";
import Container from "./container";

export default function Layout() {
  return (
    <>
      <header>Header</header>
      <Container>
        <Outlet />
      </Container>
      <footer>Footer</footer>
    </>
  );
}
