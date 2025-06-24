"use client";

import FormationBuff from "@/components/FormationBuff";
import { StatTable } from "@/components/UI/LazyLoading";
import PageRoot from "@/components/UI/PageRoot";
import { Container } from "react-bootstrap";

export default function App() {
  return (
    <PageRoot>
      <Container fluid="xxl">
        <h1>バフ一覧</h1>
        <h2>編成バフ</h2>
        <StatTable src={FormationBuff.tableData} />
      </Container>
    </PageRoot>
  );
}
