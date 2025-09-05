import Header from "@/components/UI/Header";
import InfoAlert from "@/components/UI/InfoAlert";
import type { ReactNode } from "react";
import { Container } from "react-bootstrap";

function NotFound(): ReactNode {
  return (
    <>
      <Header />
      <main>
        <Container>
          <InfoAlert.Warning />
        </Container>
      </main>
    </>
  );
}

export default NotFound;
