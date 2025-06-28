import { TablesFormationBuff } from "@/components/UI/Tables";
import PageRoot from "@/components/UI/PageRoot";
import { Container } from "react-bootstrap";

export default function App() {
  return (
    <PageRoot>
      <Container fluid="xxl">
        <h1>バフ一覧</h1>
        <h2>編成バフ</h2>
        <TablesFormationBuff className="mb-5" />
        <h2>戦闘中バフ</h2>
        <TablesFormationBuff className="mb-5" />
      </Container>
    </PageRoot>
  );
}
