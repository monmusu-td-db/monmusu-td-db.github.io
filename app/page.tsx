"use client";

import { useMemo } from "react";

import Situation from "@/components/Situation";
import { StatTable } from "@/components/LazyLoading";
import Panel from "./Panel";
import Header from "./Navbar";
import { Container } from "react-bootstrap";

export default function App() {
  return (
    <>
      <Panel.Contexts.PageType.Provider value="situation">
        <Header />
      </Panel.Contexts.PageType.Provider>
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
