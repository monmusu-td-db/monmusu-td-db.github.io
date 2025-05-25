import { Container } from "react-bootstrap";
import { FormationBuffTable } from "./FormationBuffTable";
import type { ReactNode } from "react";
import { InBattleBuffTable } from "./InBattleBuffTable";
import PageRoot from "@/components/UI/PageRoot";

export default function Page() {
  return (
    <PageRoot>
      <Container fluid="xxl" style={{ marginBottom: "50vh" }}>
        <h1>バフ一覧</h1>
        <h2>編成バフ</h2>
        <TableContainer>
          <FormationBuffTable />
        </TableContainer>
        <h2>戦闘中バフ</h2>
        <TableContainer>
          <InBattleBuffTable />
        </TableContainer>
      </Container>
    </PageRoot>
  );
}

function TableContainer({ children }: { children: ReactNode }) {
  return <div className="table-container">{children}</div>;
}
