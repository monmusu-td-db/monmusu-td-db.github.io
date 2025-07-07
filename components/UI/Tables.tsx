"use client";

import FormationBuff from "../FormationBuff";
import InBattleBuffVariants from "../InBattleBuffVariants";
import Situation from "../Situation";
import Unit from "../Unit";
import type { StatTableProps } from "./StatTableUtil";
import type StatTableType from "./StatTable";
import dynamic from "next/dynamic";

function Loading() {
  return (
    <div className="position-absolute top-50 start-50 translate-middle">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
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
} as const;
