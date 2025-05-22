"use client";

import { useMemo } from "react";

import Situation from "@/components/Situation";
import { StatTable } from "@/components/LazyLoading";
import PageRoot from "@/components/UI/PageRoot";

export default function App() {
  return (
    <PageRoot pageType="situation">
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
    </PageRoot>
  );
}
