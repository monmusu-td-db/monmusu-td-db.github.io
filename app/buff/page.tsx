import {
  TablesFormationBuff,
  // TablesInBattleBuff,
  TablesInBattleBuffAttackSpeed,
  TablesInBattleBuffBase,
  TablesInBattleBuffDamage,
  TablesInBattleBuffDefensive,
  TablesInBattleBuffField,
  TablesInBattleBuffMoveSpeed,
  TablesInBattleBuffRedeploy,
  TablesInBattleBuffStatus,
  TablesInBattleBuffWeather,
} from "@/components/UI/Tables";
import PageRoot from "@/components/UI/PageRoot";
import { Container } from "react-bootstrap";
import Link from "next/link";

export default function App() {
  return (
    <PageRoot pageType="buff">
      <Container fluid="xxl">
        <h1>バフ一覧</h1>
        <FormationBuff />
        {/* <InBattleBuff /> */}
        <InBattleBuffBase />
        <InBattleBuffDamage />
        <InBattleBuffDefensive />
        <InBattleBuffAttackSpeed />
        <InBattleBuffMoveSpeed />
        <InBattleBuffRedeploy />
        <InBattleBuffField />
        <InBattleBuffStatus />
        <InBattleBuffWeather />
      </Container>
      <Container className="md-content">
        <Description />
      </Container>
    </PageRoot>
  );
}

function FormationBuff() {
  return (
    <>
      <h2>編成バフ</h2>
      <TablesFormationBuff id="formation" className="mb-5" showIcon />
    </>
  );
}

// function InBattleBuff() {
//   return (
//     <>
//       <h2>戦闘中バフ</h2>
//       <TablesInBattleBuff id="in-battle" className="mb-5" />
//     </>
//   );
// }

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

function InBattleBuffField() {
  return (
    <>
      <h2>マスバフ</h2>
      <TablesInBattleBuffField id="in-battle-field" className="mb-5" />
    </>
  );
}

function InBattleBuffStatus() {
  return (
    <>
      <h2>状態異常耐性バフ</h2>
      <TablesInBattleBuffStatus id="in-battle-status" className="mb-5" />
    </>
  );
}

function InBattleBuffWeather() {
  return (
    <>
      <h2>天候変化</h2>
      <TablesInBattleBuffWeather id="in-battle-weather" className="mb-5" />
    </>
  );
}

function Description() {
  return (
    <>
      <h2>解説</h2>
      <p>
        基本的な使い方は<Link href="./#description">メインページ</Link>
        と同じなので、そちらも参考にしてください。
      </p>
      <p>
        補足欄に書かれている赤字は限定条件です。
        この条件を満たした場合のみ適用されることを示しています。
      </p>
      <p>
        クリティカル率増加の項目にあるカッコは、クリティカル<b>上限</b>
        増加効果を表しています。
      </p>
      <p>
        いわゆる加算バフはこのページには表示していません。代わりに
        <Link href="./">メインページ</Link>に含まれています。
      </p>
    </>
  );
}
