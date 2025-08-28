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
import type { ReactNode } from "react";

interface HeaderData {
  id: string;
  name: string;
}

const headers = {
  FORMATION: {
    id: "formation",
    name: "編成バフ",
  },
  BASE: {
    id: "base",
    name: "基礎能力値バフ",
  },
  DAMAGE: {
    id: "damage",
    name: "ダメージバフ",
  },
  DEFENSIVE: {
    id: "defensive",
    name: "防御系バフ",
  },
  ATTACK_SPEED: {
    id: "attack-speed",
    name: "攻撃速度バフ",
  },
  MOVE_SPEED: {
    id: "move-speed",
    name: "移動速度バフ",
  },
  DEPLOYMENT: {
    id: "deployment",
    name: "再出撃バフ",
  },
  FIELD: {
    id: "field",
    name: "マスバフ",
  },
  STATUS: {
    id: "status",
    name: "状態異常耐性バフ",
  },
  WEATHER: {
    id: "weather",
    name: "天候変化",
  },
  DESC: {
    id: "description",
    name: "解説",
  },
} as const satisfies Record<string, HeaderData>;

function App() {
  return (
    <PageRoot pageType="buff">
      <Container className="md-content">
        <h1>バフ一覧</h1>
        <Toc />
      </Container>
      <Container fluid="xxl">
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
    <TableWrapper src={headers.FORMATION}>
      <TablesFormationBuff id="formation" className="mb-5" showIcon />
    </TableWrapper>
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
    <TableWrapper src={headers.BASE}>
      <TablesInBattleBuffBase id="in-battle-base" className="mb-5" />
    </TableWrapper>
  );
}

function InBattleBuffDamage() {
  return (
    <TableWrapper src={headers.DAMAGE}>
      <TablesInBattleBuffDamage id="in-battle-damage" className="mb-5" />
    </TableWrapper>
  );
}

function InBattleBuffDefensive() {
  return (
    <TableWrapper src={headers.DEFENSIVE}>
      <TablesInBattleBuffDefensive id="in-battle-defensive" className="mb-5" />
    </TableWrapper>
  );
}

function InBattleBuffAttackSpeed() {
  return (
    <TableWrapper src={headers.ATTACK_SPEED}>
      <TablesInBattleBuffAttackSpeed
        id="in-battle-attack-speed"
        className="mb-5"
      />
    </TableWrapper>
  );
}

function InBattleBuffMoveSpeed() {
  return (
    <TableWrapper src={headers.MOVE_SPEED}>
      <TablesInBattleBuffMoveSpeed id="in-battle-move-speed" className="mb-5" />
    </TableWrapper>
  );
}

function InBattleBuffRedeploy() {
  return (
    <TableWrapper src={headers.DEPLOYMENT}>
      <TablesInBattleBuffRedeploy id="in-battle-redeploy" className="mb-5" />
    </TableWrapper>
  );
}

function InBattleBuffField() {
  return (
    <TableWrapper src={headers.FIELD}>
      <TablesInBattleBuffField id="in-battle-field" className="mb-5" />
    </TableWrapper>
  );
}

function InBattleBuffStatus() {
  return (
    <TableWrapper src={headers.STATUS}>
      <TablesInBattleBuffStatus id="in-battle-status" className="mb-5" />
    </TableWrapper>
  );
}

function InBattleBuffWeather() {
  return (
    <TableWrapper src={headers.WEATHER}>
      <TablesInBattleBuffWeather id="in-battle-weather" className="mb-5" />
    </TableWrapper>
  );
}

function Description() {
  return (
    <>
      <Header src={headers.DESC} />
      <p>
        基本的な使い方は<Link href="./#description">メインページ</Link>
        と同じなので、そちらも参考にしてください。
      </p>
      <p>
        補足欄に書かれている<span className="text-require">赤字</span>
        は限定条件です。
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

function TableWrapper({
  src,
  children,
}: {
  src: HeaderData;
  children?: ReactNode;
}) {
  return (
    <>
      <Header src={src} />
      {children}
    </>
  );
}

function Header({ src }: { src: HeaderData }) {
  return <h2 id={src.id}>{src.name}</h2>;
}

function Toc() {
  return (
    <div className="md-toc mt-3 mb-5 px-1">
      <h2>項目</h2>
      <hr />
      <nav>
        <ul>
          <TocItem src={headers.FORMATION} />
          <TocItem src={headers.BASE} />
          <TocItem src={headers.DAMAGE} />
          <TocItem src={headers.DEFENSIVE} />
          <TocItem src={headers.ATTACK_SPEED} />
          <TocItem src={headers.MOVE_SPEED} />
          <TocItem src={headers.DEPLOYMENT} />
          <TocItem src={headers.FIELD} />
          <TocItem src={headers.STATUS} />
          <TocItem src={headers.WEATHER} />
          <TocItem src={headers.DESC} />
        </ul>
      </nav>
    </div>
  );
}

function TocItem({ src }: { src: HeaderData }) {
  return (
    <li>
      <a href={"#" + src.id}>{src.name}</a>
    </li>
  );
}

export default App;
