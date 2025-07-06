import {
  TablesFormationBuff,
  TablesInBattleBuff,
  TablesInBattleBuffBase,
} from "@/components/UI/Tables";
import PageRoot from "@/components/UI/PageRoot";
import { Container } from "react-bootstrap";

export default function App() {
  return (
    <PageRoot>
      <Container fluid="xxl">
        <h1>バフ一覧</h1>
        {/* <FormationBuff/> */}
        <InBattleBuff />
        {/* <InBattleBaseBuff/> */}
      </Container>
    </PageRoot>
  );
}

function FormationBuff() {
  return (
    <>
      <h2>編成バフ</h2>
      <TablesFormationBuff id="formation" className="mb-5" />
    </>
  );
}

function InBattleBuff() {
  return (
    <>
      <h2>戦闘中バフ</h2>
      <TablesInBattleBuff id="in-battle" className="mb-5" />
    </>
  );
}

function InBattleBaseBuff() {
  return (
    <>
      <h2>基礎バフ</h2>
      <TablesInBattleBuffBase id="in-battle-base" className="mb-5" />
    </>
  );
}
