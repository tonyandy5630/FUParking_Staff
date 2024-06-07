import { Outlet } from "react-router-dom";
import Container from "./container";
import Header from "./Header";

export default function Layout() {
  return (
    <>
      <Header />
      <Container>
        <Outlet />
      </Container>
    </>
  );
}
