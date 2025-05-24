"use client";

import Situation from "@/components/Situation";
import { StatTable } from "@/components/UI/LazyLoading";
import PageRoot from "@/components/UI/PageRoot";

export default function App() {
  return (
    <PageRoot pageType="situation">
      <StatTable src={Situation.tableData} />
    </PageRoot>
  );
}
