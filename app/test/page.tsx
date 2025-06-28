import {
  TablesFormationBuff,
  TablesInBattleBuff,
} from "@/components/UI/Tables";
import PageRoot from "@/components/UI/PageRoot";
import { Container } from "react-bootstrap";

export default function App() {
  return (
    <PageRoot>
      <Container fluid="xxl">
        <h1>バフ一覧</h1>
        <div style={{ display: "none" }}>
          <h2>編成バフ</h2>
          <TablesFormationBuff id="formation" className="mb-5" />
        </div>
        <h2>戦闘中バフ</h2>
        <TablesInBattleBuff id="in-battle" className="mb-5" />
      </Container>
    </PageRoot>
  );
}
