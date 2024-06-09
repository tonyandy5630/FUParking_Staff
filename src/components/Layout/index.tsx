import { Outlet } from "react-router-dom";
import Container from "./container";

export default function Layout() {
  return (
    <>
      <Container>
        <Outlet />
      </Container>
    </>
  );
}
