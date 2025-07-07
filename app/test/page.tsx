import {
  TablesFormationBuff,
  TablesInBattleBuff,
  TablesInBattleBuffAttackSpeed,
  TablesInBattleBuffBase,
  TablesInBattleBuffDamage,
  TablesInBattleBuffDefensive,
  TablesInBattleBuffMoveSpeed,
  TablesInBattleBuffRedeploy,
} from "@/components/UI/Tables";
import PageRoot from "@/components/UI/PageRoot";
import { Container } from "react-bootstrap";

export default function App() {
  return (
    <PageRoot>
      <Container fluid="xxl">
        <h1>バフ一覧</h1>
        {/* <FormationBuff /> */}
        <InBattleBuff />
        {/* <InBattleBaseBuff/> */}
        {/* <InBattleBuffDamage /> */}
        <InBattleBuffDefensive />
        {/* <InBattleBuffAttackSpeed /> */}
        {/* <InBattleBuffMoveSpeed /> */}
        {/* <InBattleBuffRedeploy /> */}
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

function InBattleBuffBase() {
  return (
    <>
      <h2>基礎能力値バフ</h2>
      <TablesInBattleBuffBase id="in-battle-base" className="mb-5" />
    </>
  );
}

function InBattleBuffDamage() {
  return (
    <>
      <h2>ダメージバフ</h2>
      <TablesInBattleBuffDamage id="in-battle-damage" className="mb-5" />
    </>
  );
}

function InBattleBuffDefensive() {
  return (
    <>
      <h2>防御系バフ</h2>
      <TablesInBattleBuffDefensive id="in-battle-defensive" className="mb-5" />
    </>
  );
}

function InBattleBuffAttackSpeed() {
  return (
    <>
      <h2>攻撃速度バフ</h2>
      <TablesInBattleBuffAttackSpeed
        id="in-battle-attack-speed"
        className="mb-5"
      />
    </>
  );
}

function InBattleBuffMoveSpeed() {
  return (
    <>
      <h2>移動速度バフ</h2>
      <TablesInBattleBuffMoveSpeed id="in-battle-move-speed" className="mb-5" />
    </>
  );
}

function InBattleBuffRedeploy() {
  return (
    <>
      <h2>再出撃バフ</h2>
      <TablesInBattleBuffRedeploy id="in-battle-redeploy" className="mb-5" />
    </>
  );
}
