"use client";

import { useTableStates } from "@/components/States";
import NavigationBar from "@/components/NavigationBar";
import StatTable from "@/components/StatTable";
import Unit from "@/components/Unit";
import { useMemo } from "react";

export default function Page() {
  const [states, handleChange] = useTableStates();

  return (
    <>
      <NavigationBar states={states} onChange={handleChange} />
      <StatTable
        states={states}
        src={useMemo(() => ({
          list: Unit.list,
          columns: Unit.keys,
          comparer: Unit.comparer,
          filter: Unit.filter,
        }), [])}
      />
    </>
  );
}
