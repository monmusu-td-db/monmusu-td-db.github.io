"use client";

import { useMemo } from "react";

import Situation from "@/components/Situation";
import { StatTable } from "@/components/LazyLoading";
import Header from "../components/UI/Navbar";

export default function App() {
  return (
    <>
      <Header pageType="situation" />
      <main>
        <StatTable
          src={useMemo(
            () => ({
              list: Situation.list,
              columns: Situation.keys,
              comparer: Situation.comparer,
              filter: Situation.filter,
            }),
            []
          )}
        />
      </main>
    </>
  );
}
