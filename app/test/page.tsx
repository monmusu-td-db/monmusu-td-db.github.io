"use client";

import { useMemo } from "react";

import Situation from "@/components/Situation";
import Header from "@/components/UI/Navbar";
import StatTable from "@/components/UI/StatTable";

export default function App() {
  return (
    <>
      <Header pageType="situation" />
      <main>
        <StatTable />
      </main>
    </>
  );
}
