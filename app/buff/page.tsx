"use client";

import { Container } from "react-bootstrap";
import Header from "../Header";
import { FormationBuffTable } from "./FormationBuffTable";

export default function Page() {
  return (
    <>
      <Header />
      <Container fluid="xxl">
        <h1>バフ一覧</h1>
        <h2>編成バフ</h2>
        <FormationBuffTable />
      </Container>
    </>
  );
}
