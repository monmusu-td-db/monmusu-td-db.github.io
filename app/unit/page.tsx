"use client";

import Unit from "@/components/Unit";
import { useMemo } from "react";
import { StatTable } from "@/components/LazyLoading";
import Panel from "../Panel";
import Header from "../Navbar";

export default function Page() {
  return (
    <>
      <Panel.Contexts.PageType.Provider value={undefined}>
        <Header />
      </Panel.Contexts.PageType.Provider>
      <main>
        <StatTable
          src={useMemo(
            () => ({
              list: Unit.list,
              columns: Unit.keys,
              comparer: Unit.comparer,
              filter: Unit.filter,
            }),
            []
          )}
        />
      </main>
    </>
  );
}
