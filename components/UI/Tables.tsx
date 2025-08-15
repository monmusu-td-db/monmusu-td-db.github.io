"use client";

import FormationBuff from "../FormationBuff";
import InBattleBuffVariants from "../InBattleBuffVariants";
import Situation from "../Situation";
import Unit from "../Unit";
import type { StatTableProps } from "./StatTableUtil";
import type StatTableType from "./StatTable";
import dynamic from "next/dynamic";
import { Container } from "react-bootstrap";
import { useEffect } from "react";

function Loading() {
  useEffect(() => {
    return () => {
      window.__removeLoadingId("dynamic");
    };
  }, []);

  return (
    <Container>
      <script
        id="dynamic-loading"
        dangerouslySetInnerHTML={{
          __html: `
(() => {
  window.__setLoadingId("dynamic");
})()
        `,
        }}
      />
      <div
        className="d-flex justify-content-center align-items-center border"
        style={{ height: "100px" }}
      >
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </Container>
  );
}

const LazyLoading = dynamic(() => import("./StatTable"), {
  ssr: false,
  loading: () => <Loading />,
}) as typeof StatTableType;

export function TablesUnit(props: StatTableProps) {
  return <LazyLoading {...props} src={Unit.tableData} />;
}

export function TablesSituation(props: StatTableProps) {
  return <LazyLoading {...props} src={Situation.tableData} />;
}

export function TablesFormationBuff(props: StatTableProps) {
  return <LazyLoading {...props} src={FormationBuff.tableData} />;
}

export function TablesInBattleBuff(props: StatTableProps) {
  return <LazyLoading {...props} src={InBattleBuffVariants.tableData} />;
}

export function TablesInBattleBuffBase(props: StatTableProps) {
  return <LazyLoading {...props} src={InBattleBuffVariants.tableDataBase} />;
}

export function TablesInBattleBuffDamage(props: StatTableProps) {
  return <LazyLoading {...props} src={InBattleBuffVariants.tableDataDamage} />;
}

export function TablesInBattleBuffDefensive(props: StatTableProps) {
  return (
    <LazyLoading {...props} src={InBattleBuffVariants.tableDataDefensive} />
  );
}

export function TablesInBattleBuffAttackSpeed(props: StatTableProps) {
  return (
    <LazyLoading {...props} src={InBattleBuffVariants.tableDataAttackSpeed} />
  );
}

export function TablesInBattleBuffMoveSpeed(props: StatTableProps) {
  return (
    <LazyLoading {...props} src={InBattleBuffVariants.tableDataMoveSpeed} />
  );
}

export function TablesInBattleBuffRedeploy(props: StatTableProps) {
  return (
    <LazyLoading {...props} src={InBattleBuffVariants.tableDataRedeploy} />
  );
}

export function TablesInBattleBuffField(props: StatTableProps) {
  return <LazyLoading {...props} src={InBattleBuffVariants.tableDataField} />;
}

export function TablesInBattleBuffStatus(props: StatTableProps) {
  return <LazyLoading {...props} src={InBattleBuffVariants.tableDataStatus} />;
}

export function TablesInBattleBuffWeather(props: StatTableProps) {
  return <LazyLoading {...props} src={InBattleBuffVariants.tableDataWeather} />;
}

export default {
  Unit: TablesUnit,
  Situation: TablesSituation,
  FormationBuff: TablesFormationBuff,
  InBattleBuff: TablesInBattleBuff,
  InBattleBuffBase: TablesInBattleBuffBase,
  InBattleBuffDamage: TablesInBattleBuffDamage,
  InBattleBuffDefensive: TablesInBattleBuffDefensive,
  InBattleBuffAttackSpeed: TablesInBattleBuffAttackSpeed,
  InBattleBuffMoveSpeed: TablesInBattleBuffMoveSpeed,
  InBattleBuffRedeploy: TablesInBattleBuffRedeploy,
  InBattleBuffField: TablesInBattleBuffField,
  InBattleBuffStatus: TablesInBattleBuffStatus,
  InBattleBuffWeather: TablesInBattleBuffWeather,
} as const;
