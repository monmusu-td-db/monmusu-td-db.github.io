"use client";

import Unit from "@/components/Unit";
import { StatTable } from "@/components/UI/LazyLoading";
import PageRoot from "@/components/UI/PageRoot";

export default function App() {
  return (
    <PageRoot>
      <StatTable src={Unit.tableData} />
    </PageRoot>
  );
}
