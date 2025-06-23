"use client";

import FormationBuff from "@/components/FormationBuff";
import { StatTable } from "@/components/UI/LazyLoading";
import PageRoot from "@/components/UI/PageRoot";

export default function App() {
  return (
    <PageRoot>
      <StatTable src={FormationBuff.tableData} />
    </PageRoot>
  );
}
