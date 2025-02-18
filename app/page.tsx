"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";

import { useTableStates } from "@/components/States";
import NavigationBar from "@/components/NavigationBar";
import type StatTableType from "@/components/StatTable";
import Situation from "@/components/Situation";

const StatTable = dynamic(() => import("@/components/StatTable"), {
  ssr: false,
  loading: () => <>Loading...</>
}) as typeof StatTableType;

export default function App() {
  const [states, handleChange] = useTableStates();

  return (
    <>
      <NavigationBar states={states} onChange={handleChange} isSituation />
      <StatTable
        states={states}
        src={useMemo(() => ({
          list: Situation.list,
          columns: Situation.keys,
          comparer: Situation.comparer,
          filter: Situation.filter,
        }), [])}
      />
    </>
  );
}
