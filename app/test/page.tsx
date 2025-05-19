"use client";

import Unit from "@/components/Unit";
import Header from "@/components/UI/Navbar";
import StatTable from "@/components/UI/StatTable";

export default function App() {
  return (
    <>
      <Header pageType="situation" />
      <main>
        <StatTable src={Unit.tableData} />
      </main>
    </>
  );
}
