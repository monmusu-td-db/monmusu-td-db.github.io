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

export default {
  Unit: TablesUnit,
  Situation: TablesSituation,
  FormationBuff: TablesFormationBuff,
  InBattleBuff: TablesInBattleBuff,
} as const;
