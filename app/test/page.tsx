"use client";

import LoadingIndicator from "@/components/UI/LoadingIndicator";
import cn from "classnames";
import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";

function App() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <>
      <div style={{ marginTop: "100px" }} />
      <Container>
        <div
          className="d-flex justify-content-center align-items-center border"
          style={{ height: "250px" }}
        >
          <LoadingIndicator.Icon className={cn({ hide: !show })} />
        </div>
      </Container>
    </>
  );
}

export default App;
