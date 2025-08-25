import Header from "@/components/UI/Header";
import Images from "@/components/UI/Images";
import type { ReactNode } from "react";
import { Alert, Col, Container, Row } from "react-bootstrap";

function NotFound(): ReactNode {
  return (
    <>
      <Header />
      <main>
        <Container>
          <Alert variant="warning">
            <Row>
              <Col xs={12} sm={5} md={4}>
                <Images.NotFound className="d-block mx-auto" />
              </Col>
              <Col xs={12} sm={7} md={8} className="d-flex align-items-center">
                ページが見つかりませんでした。
              </Col>
            </Row>
          </Alert>
        </Container>
      </main>
    </>
  );
}

export default NotFound;
