import { TablesFormationBuff } from "@/components/UI/Tables";
import PageRoot from "@/components/UI/PageRoot";
import { Container } from "react-bootstrap";

export default function App() {
  return (
    <PageRoot>
      <Container fluid="xxl">
        <h1>バフ一覧</h1>
        <div>
          <h2>編成バフ</h2>
          <TablesFormationBuff id="formation" className="mb-5" />
        </div>
      </Container>
    </PageRoot>
  );
}
