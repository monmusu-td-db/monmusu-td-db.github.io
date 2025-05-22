"use client";

import Unit from "@/components/Unit";
import { useMemo } from "react";
import { StatTable } from "@/components/LazyLoading";
import PageRoot from "@/components/UI/PageRoot";

export default function Page() {
  return (
    <PageRoot>
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
    </PageRoot>
  );
}
